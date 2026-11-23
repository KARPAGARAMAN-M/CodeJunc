package com.codejunc.controller;

import com.codejunc.dto.ExecuteRequest;
import com.codejunc.dto.ExecuteResponse;
import com.codejunc.service.Judge0Service;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api")
public class ExecutionController {

    private static final Logger log = LoggerFactory.getLogger(ExecutionController.class);

    private final Judge0Service judge0Service;

    public ExecutionController(Judge0Service judge0Service) {
        this.judge0Service = judge0Service;
    }

    /**
     * Code execution endpoint.
     * Expects: { "language": "python", "sourceCode": "...", "stdin": "..." }
     */
    @PostMapping("/execute")
    public ResponseEntity<ExecuteResponse> executeCode(@Valid @RequestBody ExecuteRequest request) {
        log.info("Received execution request for language: {}", request.getLanguage());
        ExecuteResponse response = judge0Service.execute(request);
        return ResponseEntity.ok(response);
    }

    /**
     * Health check endpoint to verify backend status.
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> healthCheck() {
        return ResponseEntity.ok(Map.of(
                "status", "UP",
                "service", "CodeJunc Backend",
                "version", "1.0.0"
        ));
    }
}
