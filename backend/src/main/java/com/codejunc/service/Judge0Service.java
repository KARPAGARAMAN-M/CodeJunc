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
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;

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
        String requestId = UUID.randomUUID().toString().substring(0, 8);
        Integer languageId = resolveLanguageId(request.getLanguage());

        String normalizedLang = request.getLanguage().trim().toLowerCase(Locale.ROOT);
        boolean isJava = normalizedLang.equals("java");

        // Java JVM requires adequate memory and execution allowance for compilation and VM startup
        double cpuLimit = isJava ? properties.getCpuTimeLimit() : 5.0;
        double wallLimit = properties.getWallTimeLimit();
        int memLimit = isJava ? properties.getJavaMemoryLimit() : properties.getMemoryLimit();

        log.info("[req:{}] Submitting execution for language: {} (Judge0 ID: {}, cpuLimit: {}s, wallLimit: {}s, memoryLimit: {}KB)",
                requestId, request.getLanguage(), languageId, cpuLimit, wallLimit, memLimit);

        // 1. Submit code to Judge0
        Judge0SubmissionRequest submissionReq = new Judge0SubmissionRequest(
                request.getSourceCode(),
                languageId,
                request.getStdin() != null ? request.getStdin() : "",
                cpuLimit,
                wallLimit,
                memLimit
        );

        String submitUrl = UriComponentsBuilder.fromHttpUrl(properties.getBaseUrl())
                .path("/submissions")
                .queryParam("base64_encoded", "false")
                .queryParam("wait", "true")
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
        } catch (HttpStatusCodeException ex) {
            String errorBody = ex.getResponseBodyAsString();
            log.error("[req:{}] Judge0 returned HTTP {} at {}: {}", requestId, ex.getStatusCode(), submitUrl, errorBody);
            if (ex.getStatusCode() == HttpStatus.TOO_MANY_REQUESTS) {
                throw new ExecutionException("Execution provider rate limit exceeded. Please wait a moment and try again.");
            } else if (ex.getStatusCode() == HttpStatus.UNAUTHORIZED || ex.getStatusCode() == HttpStatus.FORBIDDEN) {
                throw new ExecutionException("Execution service authentication failed. Please check backend API credentials.");
            } else {
                throw new ExecutionException("Execution service error (" + ex.getStatusCode().value() + "): " +
                        (errorBody.isBlank() ? ex.getStatusText() : errorBody), ex);
            }
        } catch (ResourceAccessException ex) {
            log.error("[req:{}] Network error connecting to Judge0 at {}: {}", requestId, submitUrl, ex.getMessage());
            throw new ExecutionException("Network connection to execution service timed out or was unreachable.", ex);
        } catch (RestClientException ex) {
            log.error("[req:{}] Failed to submit code to Judge0 at {}: {}", requestId, submitUrl, ex.getMessage());
            throw new ExecutionException("Unable to connect to code execution service: " + ex.getMessage(), ex);
        }

        if (initialResponse != null) {
            Integer statusId = initialResponse.getStatusId();
            // If wait=true completed execution synchronously, return immediately (~1-3s)
            if (statusId != null && statusId > 2) {
                log.info("[req:{}] Execution completed synchronously for language {} with statusId {} ({})",
                        requestId, request.getLanguage(), statusId, initialResponse.getStatusDescription());
                return mapToExecuteResponse(initialResponse);
            }

            // If still processing or in queue, poll using token
            if (initialResponse.getToken() != null) {
                String token = initialResponse.getToken();
                log.info("[req:{}] Submission queued by Judge0. Token: {}. Starting polling...", requestId, token);
                Judge0SubmissionResponse finalResponse = pollSubmissionResult(token, requestId);
                return mapToExecuteResponse(finalResponse);
            }
        }

        throw new ExecutionException("Execution service did not return a valid submission response.");
    }

    private Judge0SubmissionResponse pollSubmissionResult(String token, String requestId) {
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
                if (response != null) {
                    Integer statusId = response.getStatusId();
                    if (statusId != null && statusId > 2) {
                        log.info("[req:{}] Polled execution completed for token {} with statusId {} ({}) in attempt {}",
                                requestId, token, statusId, response.getStatusDescription(), attempt);
                        return response;
                    }
                    log.debug("[req:{}] Token {} status: {}. Attempt {}/{}...",
                            requestId, token,
                            statusId != null && statusId == 1 ? "In Queue" : "Processing",
                            attempt, maxAttempts);
                }
            } catch (HttpStatusCodeException ex) {
                log.warn("[req:{}] HTTP {} while polling token {} on attempt {}: {}",
                        requestId, ex.getStatusCode(), token, attempt, ex.getMessage());
            } catch (RestClientException ex) {
                log.warn("[req:{}] Error polling token {} on attempt {}: {}", requestId, token, attempt, ex.getMessage());
            }

            try {
                Thread.sleep(interval);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                throw new ExecutionException("Execution polling was interrupted", e);
            }
        }

        log.warn("[req:{}] Execution polling completed without terminal status for token {}", requestId, token);
        Judge0SubmissionResponse timeoutResp = new Judge0SubmissionResponse();
        timeoutResp.setStatusId(null);
        timeoutResp.setStatus(new Judge0SubmissionResponse.Judge0Status(null, "Backend Request Timeout"));
        timeoutResp.setMessage("The execution request timed out while waiting in queue on the execution service. Please try running again.");
        return timeoutResp;
    }

    /**
     * Verify Judge0 service availability and connectivity.
     */
    public Map<String, Object> checkJudge0Health() {
        String aboutUrl = UriComponentsBuilder.fromHttpUrl(properties.getBaseUrl())
                .path("/about")
                .toUriString();
        try {
            HttpHeaders headers = createHeaders();
            HttpEntity<Void> entity = new HttpEntity<>(headers);
            ResponseEntity<Map> resp = restTemplate.exchange(aboutUrl, HttpMethod.GET, entity, Map.class);
            if (resp.getStatusCode().is2xxSuccessful() && resp.getBody() != null) {
                return Map.of(
                        "status", "UP",
                        "url", properties.getBaseUrl(),
                        "version", resp.getBody().getOrDefault("version", "unknown")
                );
            }
            return Map.of("status", "DEGRADED", "url", properties.getBaseUrl());
        } catch (Exception e) {
            log.warn("Judge0 health check probe failed at {}: {}", aboutUrl, e.getMessage());
            return Map.of(
                    "status", "DOWN",
                    "url", properties.getBaseUrl(),
                    "error", e.getMessage()
            );
        }
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

        // For compilation errors, ensure compileOutput is populated even if returned in stderr
        if ("Compilation Error".equalsIgnoreCase(statusDescription) && (compileOutput == null || compileOutput.isBlank())) {
            compileOutput = stderr != null ? stderr : message;
        }

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
