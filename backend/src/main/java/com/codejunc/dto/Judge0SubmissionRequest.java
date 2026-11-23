package com.codejunc.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class Judge0SubmissionRequest {

    @JsonProperty("source_code")
    private String sourceCode;

    @JsonProperty("language_id")
    private Integer languageId;

    @JsonProperty("stdin")
    private String stdin;

    @JsonProperty("cpu_time_limit")
    private Double cpuTimeLimit;

    @JsonProperty("memory_limit")
    private Integer memoryLimit;

    public Judge0SubmissionRequest() {
    }

    public Judge0SubmissionRequest(String sourceCode, Integer languageId, String stdin, Double cpuTimeLimit, Integer memoryLimit) {
        this.sourceCode = sourceCode;
        this.languageId = languageId;
        this.stdin = stdin;
        this.cpuTimeLimit = cpuTimeLimit;
        this.memoryLimit = memoryLimit;
    }

    public String getSourceCode() {
        return sourceCode;
    }

    public void setSourceCode(String sourceCode) {
        this.sourceCode = sourceCode;
    }

    public Integer getLanguageId() {
        return languageId;
    }

    public void setLanguageId(Integer languageId) {
        this.languageId = languageId;
    }

    public String getStdin() {
        return stdin;
    }

    public void setStdin(String stdin) {
        this.stdin = stdin;
    }

    public Double getCpuTimeLimit() {
        return cpuTimeLimit;
    }

    public void setCpuTimeLimit(Double cpuTimeLimit) {
        this.cpuTimeLimit = cpuTimeLimit;
    }

    public Integer getMemoryLimit() {
        return memoryLimit;
    }

    public void setMemoryLimit(Integer memoryLimit) {
        this.memoryLimit = memoryLimit;
    }
}
