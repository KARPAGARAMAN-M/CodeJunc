package com.codejunc.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.time.Duration;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${codejunc.cors.allowed-origins:http://localhost:3000,http://127.0.0.1:3000}")
    private List<String> allowedOrigins;

    private final Judge0Properties judge0Properties;

    public WebConfig(Judge0Properties judge0Properties) {
        this.judge0Properties = judge0Properties;
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        Set<String> resolvedOrigins = new LinkedHashSet<>();

        // Always preserve local development origins
        resolvedOrigins.add("http://localhost:3000");
        resolvedOrigins.add("http://127.0.0.1:3000");

        // Merge configurable origins from environment / configuration (e.g. Vercel deployment domain)
        if (allowedOrigins != null) {
            for (String originItem : allowedOrigins) {
                if (originItem != null && !originItem.isBlank()) {
                    // Split in case originItem contains multiple comma-separated entries
                    for (String singleOrigin : originItem.split(",")) {
                        String trimmed = singleOrigin.trim();
                        // Security requirement: Never permit wildcard '*' with credentials enabled
                        if (!trimmed.isEmpty() && !trimmed.equals("*")) {
                            resolvedOrigins.add(trimmed);
                        }
                    }
                }
            }
        }

        registry.addMapping("/api/**")
                .allowedOrigins(resolvedOrigins.toArray(new String[0]))
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
    }

    @Bean
    public RestTemplate restTemplate(RestTemplateBuilder builder) {
        return builder
                .setConnectTimeout(Duration.ofMillis(judge0Properties.getConnectTimeoutMs()))
                .setReadTimeout(Duration.ofMillis(judge0Properties.getReadTimeoutMs()))
                .build();
    }
}
