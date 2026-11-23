package com.codejunc.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.ALWAYS)
public class ExecuteResponse {

    private String status;
    private String stdout;
    private String stderr;
    private String compileOutput;
    private String message;
    private String time;
    private Long memory;

    public ExecuteResponse() {
    }

    public ExecuteResponse(String status, String stdout, String stderr, String compileOutput, String message, String time, Long memory) {
        this.status = status;
        this.stdout = stdout;
        this.stderr = stderr;
        this.compileOutput = compileOutput;
        this.message = message;
        this.time = time;
        this.memory = memory;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private String status;
        private String stdout;
        private String stderr;
        private String compileOutput;
        private String message;
        private String time;
        private Long memory;

        public Builder status(String status) {
            this.status = status;
            return this;
        }

        public Builder stdout(String stdout) {
            this.stdout = stdout;
            return this;
        }

        public Builder stderr(String stderr) {
            this.stderr = stderr;
            return this;
        }

        public Builder compileOutput(String compileOutput) {
            this.compileOutput = compileOutput;
            return this;
        }

        public Builder message(String message) {
            this.message = message;
            return this;
        }

        public Builder time(String time) {
            this.time = time;
            return this;
        }

        public Builder memory(Long memory) {
            this.memory = memory;
            return this;
        }

        public ExecuteResponse build() {
            return new ExecuteResponse(status, stdout, stderr, compileOutput, message, time, memory);
        }
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
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
}
