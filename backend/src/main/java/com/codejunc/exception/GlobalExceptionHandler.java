package com.codejunc.exception;

import com.codejunc.dto.ExecuteResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ExecuteResponse> handleValidationExceptions(MethodArgumentNotValidException ex) {
        String errorMessage = ex.getBindingResult().getFieldErrors().stream()
                .map(FieldError::getDefaultMessage)
                .collect(Collectors.joining("; "));

        log.warn("Validation error: {}", errorMessage);

        ExecuteResponse response = ExecuteResponse.builder()
                .status("Bad Request")
                .message(errorMessage)
                .stderr(errorMessage)
                .build();

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    @ExceptionHandler(LanguageNotSupportedException.class)
    public ResponseEntity<ExecuteResponse> handleLanguageNotSupported(LanguageNotSupportedException ex) {
        log.warn("Unsupported language: {}", ex.getMessage());

        ExecuteResponse response = ExecuteResponse.builder()
                .status("Unsupported Language")
                .message(ex.getMessage())
                .stderr(ex.getMessage())
                .build();

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    @ExceptionHandler(RateLimitException.class)
    public ResponseEntity<ExecuteResponse> handleRateLimit(RateLimitException ex) {
        log.warn("Rate limit exceeded: {}", ex.getMessage());

        ExecuteResponse response = ExecuteResponse.builder()
                .status("Rate Limit Exceeded")
                .message(ex.getMessage())
                .stderr(ex.getMessage())
                .build();

        return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS).body(response);
    }

    @ExceptionHandler(ExecutionException.class)
    public ResponseEntity<ExecuteResponse> handleExecutionException(ExecutionException ex) {
        log.error("Execution service error: {}", ex.getMessage());

        ExecuteResponse response = ExecuteResponse.builder()
                .status("Execution Service Error")
                .message(ex.getMessage())
                .stderr(ex.getMessage())
                .build();

        return ResponseEntity.status(HttpStatus.BAD_GATEWAY).body(response);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ExecuteResponse> handleGeneralException(Exception ex) {
        log.error("Unexpected internal server error: ", ex);

        ExecuteResponse response = ExecuteResponse.builder()
                .status("Internal Server Error")
                .message("An unexpected error occurred during execution.")
                .stderr("Internal Server Error: " + ex.getMessage())
                .build();

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }
}
