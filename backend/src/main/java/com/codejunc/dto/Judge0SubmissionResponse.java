package com.codejunc.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonIgnoreProperties(ignoreUnknown = true)
public class Judge0SubmissionResponse {

    @JsonProperty("token")
    private String token;

    @JsonProperty("stdout")
    private String stdout;

    @JsonProperty("stderr")
    private String stderr;

    @JsonProperty("compile_output")
    private String compileOutput;

    @JsonProperty("message")
    private String message;

    @JsonProperty("time")
    private String time;

    @JsonProperty("memory")
    private Long memory;

    @JsonProperty("status_id")
    private Integer statusId;

    @JsonProperty("status")
    private Judge0Status status;

    public Judge0SubmissionResponse() {
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getStdout() {
        return stdout;
    }

    public void setStdout(String stdout) {
        this.stdout = stdout;
    }

    public String getStderr() {
        return stderr;
    }

    public void setStderr(String stderr) {
        this.stderr = stderr;
    }

    public String getCompileOutput() {
        return compileOutput;
    }

    public void setCompileOutput(String compileOutput) {
        this.compileOutput = compileOutput;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getTime() {
        return time;
    }

    public void setTime(String time) {
        this.time = time;
    }

    public Long getMemory() {
        return memory;
    }

    public void setMemory(Long memory) {
        this.memory = memory;
    }

    public Integer getStatusId() {
        if (statusId != null) {
            return statusId;
        }
        if (status != null && status.getId() != null) {
            return status.getId();
        }
        return null;
    }

    public void setStatusId(Integer statusId) {
        this.statusId = statusId;
    }

    public String getStatusDescription() {
        if (status != null && status.getDescription() != null) {
            return status.getDescription();
        }
        return null;
    }

    public Judge0Status getStatus() {
        return status;
    }

    public void setStatus(Judge0Status status) {
        this.status = status;
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Judge0Status {
        @JsonProperty("id")
        private Integer id;

        @JsonProperty("description")
        private String description;

        public Judge0Status() {
        }

        public Judge0Status(Integer id, String description) {
            this.id = id;
            this.description = description;
        }

        public Integer getId() {
            return id;
        }

        public void setId(Integer id) {
            this.id = id;
        }

        public String getDescription() {
            return description;
        }

        public void setDescription(String description) {
            this.description = description;
        }
    }
}
