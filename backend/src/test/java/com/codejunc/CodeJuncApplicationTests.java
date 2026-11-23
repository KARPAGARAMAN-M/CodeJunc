package com.codejunc;

import com.codejunc.dto.ExecuteRequest;
import com.codejunc.dto.ExecuteResponse;
import com.codejunc.service.Judge0Service;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class CodeJuncApplicationTests {

    @Autowired
    private TestRestTemplate restTemplate;

    @MockBean
    private Judge0Service judge0Service;

    @Test
    void contextLoads() {
    }

    @Test
    void testHealthEndpoint() {
        ResponseEntity<String> response = restTemplate.getForEntity("/api/health", String.class);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getBody().contains("UP"));
    }

    @Test
    void testExecuteEndpointValidation() {
        // Missing source code
        ExecuteRequest invalidReq = new ExecuteRequest("python", "", "");
        ResponseEntity<ExecuteResponse> response = restTemplate.postForEntity("/api/execute", invalidReq, ExecuteResponse.class);
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("Bad Request", response.getBody().getStatus());
    }

    @Test
    void testExecuteEndpointSuccess() {
        ExecuteResponse mockResponse = ExecuteResponse.builder()
                .status("Accepted")
                .stdout("Hello World\n")
                .time("0.02")
                .memory(3500L)
                .build();

        when(judge0Service.execute(any(ExecuteRequest.class))).thenReturn(mockResponse);

        ExecuteRequest validReq = new ExecuteRequest("python", "print('Hello World')", "");
        ResponseEntity<ExecuteResponse> response = restTemplate.postForEntity("/api/execute", validReq, ExecuteResponse.class);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("Accepted", response.getBody().getStatus());
        assertEquals("Hello World\n", response.getBody().getStdout());
    }
}
