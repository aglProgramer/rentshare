package com.rentshare.api.service;

import lombok.AllArgsConstructor;
import lombok.Data;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class CaptchaService {

    @Value("${recaptcha.secret:}")
    private String apiKey;

    private static final String PROJECT_ID = "rentshare-495819";
    private static final String SITE_KEY = "6Lfrd-EsAAAAADV0hu4mT3ztOeJk8fZfmdO838JW";
    private static final String ENTERPRISE_ENDPOINT = "https://recaptchaenterprise.googleapis.com/v1/projects/" + PROJECT_ID + "/assessments?key=";

    public boolean verify(String token) {
        if (apiKey == null || apiKey.isEmpty()) {
            return true;
        }

        try {
            RestTemplate restTemplate = new RestTemplate();
            String url = ENTERPRISE_ENDPOINT + apiKey;
            EnterpriseRequest request = new EnterpriseRequest(new Event(token, SITE_KEY));
            
            EnterpriseResponse response = restTemplate.postForObject(url, request, EnterpriseResponse.class);
            
            if (response == null || response.getTokenProperties() == null) return false;
            
            return response.getTokenProperties().isValid() && 
                   response.getRiskAnalysis() != null && 
                   response.getRiskAnalysis().getScore() >= 0.5;
                   
        } catch (Exception e) {
            return false;
        }
    }

    @Data
    @AllArgsConstructor
    static class EnterpriseRequest {
        private Event event;
    }

    @Data
    @AllArgsConstructor
    static class Event {
        private String token;
        private String siteKey;
    }

    @Data
    static class EnterpriseResponse {
        private RiskAnalysis riskAnalysis;
        private TokenProperties tokenProperties;
    }

    @Data
    static class RiskAnalysis {
        private float score;
    }

    @Data
    static class TokenProperties {
        private boolean valid;
        private String invalidReason;
    }
}
