package com.ucms.service;

import com.ucms.dto.AiAnalysisRequest;
import com.ucms.dto.AiAnalysisResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.client.RestClientException;

@Service
public class AiService {

    @Value("${app.ai.service.url:http://localhost:8000}")
    private String aiServiceUrl;

    private final RestTemplate restTemplate;

    public AiService() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(3000);
        factory.setReadTimeout(5000);
        this.restTemplate = new RestTemplate(factory);
    }


    public String getAiServiceUrl() {
        return aiServiceUrl;
    }

    public RestTemplate getRestTemplate() {
        return restTemplate;
    }

    public void setAiServiceUrl(String aiServiceUrl) {
        this.aiServiceUrl = aiServiceUrl;
    }

    public AiAnalysisResponse analyze(AiAnalysisRequest request) {
        String endpoint = aiServiceUrl + "/api/v1/ai/analyze";
        try {
            return restTemplate.postForObject(endpoint, request, AiAnalysisResponse.class);
        } catch (RestClientException e) {
            throw new RuntimeException("AI Service is temporarily unavailable: " + e.getMessage(), e);
        }
    }
}
