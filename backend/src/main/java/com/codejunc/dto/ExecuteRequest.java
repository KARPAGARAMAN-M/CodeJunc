package com.codejunc.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class ExecuteRequest {

    @NotBlank(message = "Language is required")
    private String language;

    @NotBlank(message = "Source code cannot be empty")
    @Size(max = 65536, message = "Source code exceeds maximum allowable limit of 64KB")
    private String sourceCode;

    @Size(max = 65536, message = "Input (stdin) exceeds maximum allowable limit of 64KB")
    private String stdin;

    public ExecuteRequest() {
    }

    public ExecuteRequest(String language, String sourceCode, String stdin) {
        this.language = language;
        this.sourceCode = sourceCode;
        this.stdin = stdin;
    }

    public String getLanguage() {
        return language;
    }

    public void setLanguage(String language) {
        this.language = language;
    }

    public String getSourceCode() {
        return sourceCode;
    }

    public void setSourceCode(String sourceCode) {
        this.sourceCode = sourceCode;
    }

    public String getStdin() {
        return stdin;
    }

    public void setStdin(String stdin) {
        this.stdin = stdin;
    }
}
