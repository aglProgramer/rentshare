package com.rentshare.api.service;

import lombok.Data;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class CaptchaService {

    @Value("${recaptcha.secret:}")
    private String secretKey;

    private static final String GOOGLE_RECAPTCHA_ENDPOINT = "https://www.google.com/recaptcha/api/siteverify";

    public boolean verify(String token) {
        if (secretKey == null || secretKey.isEmpty()) {
            // Bypass if no secret key is provided (useful for dev)
            return true;
        }

        RestTemplate restTemplate = new RestTemplate();
        String url = String.format("%s?secret=%s&response=%s", GOOGLE_RECAPTCHA_ENDPOINT, secretKey, token);
        
        try {
            CaptchaResponse response = restTemplate.postForObject(url, null, CaptchaResponse.class);
            return response != null && response.isSuccess();
        } catch (Exception e) {
            return false;
        }
    }

    @Data
    static class CaptchaResponse {
        private boolean success;
        private String challenge_ts;
        private String hostname;
    }
}
