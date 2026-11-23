package com.codejunc.service;

import com.codejunc.config.Judge0Properties;
import com.codejunc.dto.ExecuteRequest;
import com.codejunc.dto.ExecuteResponse;
import com.codejunc.dto.Judge0SubmissionRequest;
import com.codejunc.dto.Judge0SubmissionResponse;
import com.codejunc.exception.ExecutionException;
import com.codejunc.exception.LanguageNotSupportedException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Locale;
import java.util.Map;

@Service
public class Judge0Service {

    private static final Logger log = LoggerFactory.getLogger(Judge0Service.class);

    private final RestTemplate restTemplate;
    private final Judge0Properties properties;

    public Judge0Service(RestTemplate restTemplate, Judge0Properties properties) {
        this.restTemplate = restTemplate;
        this.properties = properties;
    }

    /**
     * Map frontend language key to official Judge0 language ID.
     * Supported: c, cpp, java, python, javascript
     */
    public Integer resolveLanguageId(String rawLanguage) {
        if (rawLanguage == null || rawLanguage.isBlank()) {
            throw new LanguageNotSupportedException("Language parameter is missing");
        }

        String normalized = rawLanguage.trim().toLowerCase(Locale.ROOT);
        if (normalized.equals("c++")) {
            normalized = "cpp";
        } else if (normalized.equals("js")) {
            normalized = "javascript";
        }

        Map<String, Integer> langMap = properties.getLanguages();
        Integer id = langMap.get(normalized);
        if (id == null) {
            throw new LanguageNotSupportedException("Unsupported language: '" + rawLanguage +
                    "'. Supported languages are: C, C++, Java, Python, JavaScript.");
        }
        return id;
    }

    /**
     * Execute code asynchronously via Judge0 and poll for the result.
     */
    public ExecuteResponse execute(ExecuteRequest request) {
        Integer languageId = resolveLanguageId(request.getLanguage());

        log.info("Submitting execution request for language: {} (Judge0 ID: {})",
                request.getLanguage(), languageId);

        // 1. Submit code to Judge0
        Judge0SubmissionRequest submissionReq = new Judge0SubmissionRequest(
                request.getSourceCode(),
                languageId,
                request.getStdin() != null ? request.getStdin() : "",
                properties.getCpuTimeLimit(),
                properties.getMemoryLimit()
        );

        String submitUrl = UriComponentsBuilder.fromHttpUrl(properties.getBaseUrl())
                .path("/submissions")
                .queryParam("base64_encoded", "false")
                .queryParam("wait", "false")
                .toUriString();

        HttpHeaders headers = createHeaders();
        HttpEntity<Judge0SubmissionRequest> entity = new HttpEntity<>(submissionReq, headers);

        Judge0SubmissionResponse initialResponse;
        try {
            ResponseEntity<Judge0SubmissionResponse> responseEntity = restTemplate.exchange(
                    submitUrl,
                    HttpMethod.POST,
                    entity,
                    Judge0SubmissionResponse.class
            );
            initialResponse = responseEntity.getBody();
        } catch (RestClientException ex) {
            log.error("Failed to submit code to Judge0 at {}: {}", submitUrl, ex.getMessage());
            throw new ExecutionException("Unable to connect to code execution service (Judge0): " + ex.getMessage(), ex);
        }

        if (initialResponse == null || initialResponse.getToken() == null) {
            // Check if Judge0 returned result immediately
            if (initialResponse != null && initialResponse.getStatus() != null) {
                return mapToExecuteResponse(initialResponse);
            }
            throw new ExecutionException("Execution service did not return a valid submission token.");
        }

        String token = initialResponse.getToken();
        log.info("Submission accepted by Judge0. Token: {}. Starting polling...", token);

        // 2. Poll for execution result
        Judge0SubmissionResponse finalResponse = pollSubmissionResult(token);

        return mapToExecuteResponse(finalResponse);
    }

    private Judge0SubmissionResponse pollSubmissionResult(String token) {
        String pollUrl = UriComponentsBuilder.fromHttpUrl(properties.getBaseUrl())
                .path("/submissions/" + token)
                .queryParam("base64_encoded", "false")
                .toUriString();

        HttpHeaders headers = createHeaders();
        HttpEntity<Void> entity = new HttpEntity<>(headers);

        int maxAttempts = properties.getPollMaxAttempts();
        int interval = properties.getPollIntervalMs();

        for (int attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                ResponseEntity<Judge0SubmissionResponse> responseEntity = restTemplate.exchange(
                        pollUrl,
                        HttpMethod.GET,
                        entity,
                        Judge0SubmissionResponse.class
                );

                Judge0SubmissionResponse response = responseEntity.getBody();
                if (response != null && response.getStatusId() != null) {
                    int statusId = response.getStatusId();
                    // Status 1: In Queue, Status 2: Processing
                    if (statusId > 2) {
                        log.info("Execution completed for token {} with statusId {} ({}) in attempt {}",
                                token, statusId,
                                response.getStatus() != null ? response.getStatus().getDescription() : "unknown",
                                attempt);
                        return response;
                    }
                }
            } catch (RestClientException ex) {
                log.warn("Error polling token {} on attempt {}: {}", token, attempt, ex.getMessage());
            }

            try {
                Thread.sleep(interval);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                throw new ExecutionException("Execution polling was interrupted", e);
            }
        }

        log.warn("Execution timed out waiting for token {}", token);
        Judge0SubmissionResponse timeoutResp = new Judge0SubmissionResponse();
        timeoutResp.setStatusId(5); // Time Limit Exceeded
        timeoutResp.setStatus(new Judge0SubmissionResponse.Judge0Status(5, "Time Limit Exceeded"));
        timeoutResp.setMessage("Execution timed out while waiting for output from Judge0.");
        return timeoutResp;
    }

    private ExecuteResponse mapToExecuteResponse(Judge0SubmissionResponse judge0) {
        String statusDescription = "Unknown";
        if (judge0.getStatus() != null && judge0.getStatus().getDescription() != null) {
            statusDescription = judge0.getStatus().getDescription();
        } else if (judge0.getStatusId() != null) {
            statusDescription = mapStatusId(judge0.getStatusId());
        }

        String stdout = decodeIfBase64(judge0.getStdout());
        String stderr = decodeIfBase64(judge0.getStderr());
        String compileOutput = decodeIfBase64(judge0.getCompileOutput());
        String message = decodeIfBase64(judge0.getMessage());

        return ExecuteResponse.builder()
                .status(statusDescription)
                .stdout(stdout)
                .stderr(stderr)
                .compileOutput(compileOutput)
                .message(message)
                .time(judge0.getTime())
                .memory(judge0.getMemory())
                .build();
    }

    private String mapStatusId(int id) {
        return switch (id) {
            case 1 -> "In Queue";
            case 2 -> "Processing";
            case 3 -> "Accepted";
            case 4 -> "Wrong Answer";
            case 5 -> "Time Limit Exceeded";
            case 6 -> "Compilation Error";
            case 7, 8, 9, 10, 11, 12 -> "Runtime Error";
            case 13 -> "Internal Error";
            case 14 -> "Exec Format Error";
            default -> "Status " + id;
        };
    }

    private HttpHeaders createHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set(HttpHeaders.ACCEPT, MediaType.APPLICATION_JSON_VALUE);

        String apiKey = properties.getApiKey();
        String apiHost = properties.getApiHost();

        if (apiKey != null && !apiKey.isBlank()) {
            headers.set("X-RapidAPI-Key", apiKey);
            headers.set("X-Auth-Token", apiKey);
        }
        if (apiHost != null && !apiHost.isBlank()) {
            headers.set("X-RapidAPI-Host", apiHost);
        }

        return headers;
    }

    private String decodeIfBase64(String text) {
        if (text == null) return null;
        // In case response is base64
        return text;
    }
}
