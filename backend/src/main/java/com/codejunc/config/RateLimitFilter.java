package com.codejunc.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

@Component
@Order(1)
public class RateLimitFilter extends OncePerRequestFilter {

    @Value("${codejunc.rate-limit.enabled:true}")
    private boolean enabled;

    @Value("${codejunc.rate-limit.requests-per-minute:30}")
    private int requestsPerMinute;

    private final Map<String, WindowCounter> requestCounts = new ConcurrentHashMap<>();

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        if (!enabled || !request.getRequestURI().startsWith("/api/execute")) {
            filterChain.doFilter(request, response);
            return;
        }

        String clientIp = extractClientIp(request);
        long currentWindow = System.currentTimeMillis() / 60000;

        WindowCounter counter = requestCounts.compute(clientIp, (key, existing) -> {
            if (existing == null || existing.window != currentWindow) {
                return new WindowCounter(currentWindow, 1);
            } else {
                existing.count.incrementAndGet();
                return existing;
            }
        });

        // Cleanup old windows periodically
        if (requestCounts.size() > 1000) {
            requestCounts.entrySet().removeIf(e -> e.getValue().window < currentWindow - 1);
        }

        if (counter.count.get() > requestsPerMinute) {
            response.setStatus(429);
            response.setContentType("application/json");
            response.getWriter().write("{\"status\":\"Rate Limit Exceeded\",\"stderr\":\"Too many requests. Please wait a moment before running code again.\",\"message\":\"Rate limit exceeded: maximum " + requestsPerMinute + " requests per minute.\"}");
            return;
        }

        filterChain.doFilter(request, response);
    }

    private String extractClientIp(HttpServletRequest request) {
        String xf = request.getHeader("X-Forwarded-For");
        if (xf != null && !xf.isBlank()) {
            return xf.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    private static class WindowCounter {
        final long window;
        final AtomicInteger count;

        WindowCounter(long window, int initialCount) {
            this.window = window;
            this.count = new AtomicInteger(initialCount);
        }
    }
}
