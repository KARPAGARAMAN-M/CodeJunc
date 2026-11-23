package com.codejunc.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.time.Duration;
import java.util.List;

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
        registry.addMapping("/api/**")
                .allowedOrigins(allowedOrigins.toArray(new String[0]))
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
