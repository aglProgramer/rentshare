package com.rentshare.api.service;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
@Slf4j
public class CaptchaService {

    @Value("${recaptcha.secret:}")
    private String apiKey;

    private static final String PROJECT_ID = "rentshare-495819";
    private static final String SITE_KEY = "6Lfrd-EsAAAAADV0hu4mT3ztOeJk8fZfmdO838JW";
    private static final String ENTERPRISE_ENDPOINT = "https://recaptchaenterprise.googleapis.com/v1/projects/" + PROJECT_ID + "/assessments?key=";

    public boolean verify(String token, String expectedAction) {
        if (apiKey == null || apiKey.isEmpty()) {
            log.info("Captcha verification bypassed (no API key configured)");
            return true;
        }

        try {
            RestTemplate restTemplate = new RestTemplate();
            String url = ENTERPRISE_ENDPOINT + apiKey;
            EnterpriseRequest request = new EnterpriseRequest(new Event(token, SITE_KEY, expectedAction));
            
            log.debug("Sending reCAPTCHA Enterprise request to: {}", url);
            EnterpriseResponse response = restTemplate.postForObject(url, request, EnterpriseResponse.class);
            
            if (response == null || response.getTokenProperties() == null) {
                log.warn("Empty response from Google reCAPTCHA Enterprise");
                return true; 
            }
            
            log.info("reCAPTCHA Enterprise result: Valid={}, Score={}, Action={}", 
                response.getTokenProperties().isValid(), 
                response.getRiskAnalysis() != null ? response.getRiskAnalysis().getScore() : "N/A",
                response.getTokenProperties().getAction());

            return response.getTokenProperties().isValid() && 
                   response.getRiskAnalysis() != null && 
                   response.getRiskAnalysis().getScore() >= 0.1;
                   
        } catch (Exception e) {
            log.error("Error communicating with reCAPTCHA Enterprise: {}", e.getMessage());
            return true;
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
        private String expectedAction;
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
        private String action;
    }
}
