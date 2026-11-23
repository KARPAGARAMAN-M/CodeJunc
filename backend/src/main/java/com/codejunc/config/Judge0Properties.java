package com.codejunc.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

import java.util.HashMap;
import java.util.Map;

@Configuration
@ConfigurationProperties(prefix = "judge0")
public class Judge0Properties {

    private String baseUrl = "https://ce.judge0.com";
    private String apiKey = "";
    private String apiHost = "";
    private int connectTimeoutMs = 10000;
    private int readTimeoutMs = 30000;
    private int pollIntervalMs = 800;
    private int pollMaxAttempts = 40;
    private double cpuTimeLimit = 10.0;
    private double wallTimeLimit = 15.0;
    private int memoryLimit = 512000;
    private int javaMemoryLimit = 512000;

    /**
     * Map of normalized language keys to Judge0 language IDs.
     * Supported: c, cpp, java, python, javascript
     */
    private Map<String, Integer> languages = new HashMap<>();

    public Judge0Properties() {
        // Defaults for Judge0 CE
        languages.put("c", 50);
        languages.put("cpp", 54);
        languages.put("java", 62);
        languages.put("python", 71);
        languages.put("javascript", 63);
    }

    public String getBaseUrl() {
        return baseUrl;
    }

    public void setBaseUrl(String baseUrl) {
        this.baseUrl = baseUrl;
    }

    public String getApiKey() {
        return apiKey;
    }

    public void setApiKey(String apiKey) {
        this.apiKey = apiKey;
    }

    public String getApiHost() {
        return apiHost;
    }

    public void setApiHost(String apiHost) {
        this.apiHost = apiHost;
    }

    public int getConnectTimeoutMs() {
        return connectTimeoutMs;
    }

    public void setConnectTimeoutMs(int connectTimeoutMs) {
        this.connectTimeoutMs = connectTimeoutMs;
    }

    public int getReadTimeoutMs() {
        return readTimeoutMs;
    }

    public void setReadTimeoutMs(int readTimeoutMs) {
        this.readTimeoutMs = readTimeoutMs;
    }

    public int getPollIntervalMs() {
        return pollIntervalMs;
    }

    public void setPollIntervalMs(int pollIntervalMs) {
        this.pollIntervalMs = pollIntervalMs;
    }

    public int getPollMaxAttempts() {
        return pollMaxAttempts;
    }

    public void setPollMaxAttempts(int pollMaxAttempts) {
        this.pollMaxAttempts = pollMaxAttempts;
    }

    public double getCpuTimeLimit() {
        return cpuTimeLimit;
    }

    public void setCpuTimeLimit(double cpuTimeLimit) {
        this.cpuTimeLimit = cpuTimeLimit;
    }

    public double getWallTimeLimit() {
        return wallTimeLimit;
    }

    public void setWallTimeLimit(double wallTimeLimit) {
        this.wallTimeLimit = wallTimeLimit;
    }

    public int getJavaMemoryLimit() {
        return javaMemoryLimit;
    }

    public void setJavaMemoryLimit(int javaMemoryLimit) {
        this.javaMemoryLimit = javaMemoryLimit;
    }

    public int getMemoryLimit() {
        return memoryLimit;
    }

    public void setMemoryLimit(int memoryLimit) {
        this.memoryLimit = memoryLimit;
    }

    public Map<String, Integer> getLanguages() {
        return languages;
    }

    public void setLanguages(Map<String, Integer> languages) {
        this.languages = languages;
    }
}
