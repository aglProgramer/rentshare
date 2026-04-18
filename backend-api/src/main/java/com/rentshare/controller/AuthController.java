package com.rentshare.controller;

import com.rentshare.dto.AuthRequestDTO;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
@lombok.RequiredArgsConstructor
public class AuthController {

    private final com.rentshare.repository.ProfileRepository profileRepository;

    @Value("${supabase.url}")
    private String supabaseUrl;

    @Value("${supabase.anon-key}")
    private String supabaseAnonKey;

    private HttpHeaders buildSupabaseHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("apikey", supabaseAnonKey);
        return headers;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequestDTO request) {
        RestTemplate restTemplate = new RestTemplate();
        String url = supabaseUrl + "/auth/v1/token?grant_type=password";
        
        Map<String, String> body = Map.of(
            "email", request.getEmail(),
            "password", request.getPassword()
        );

        try {
            HttpEntity<Map<String, String>> entity = new HttpEntity<>(body, buildSupabaseHeaders());
            @SuppressWarnings("unchecked")
            ResponseEntity<Map<String, Object>> response = (ResponseEntity<Map<String, Object>>) (ResponseEntity<?>) restTemplate.postForEntity(url, entity, Map.class);
            
            Map<String, Object> resBody = response.getBody();
            if (resBody != null && resBody.containsKey("access_token")) {
                Map<String, Object> user = (Map<String, Object>) resBody.get("user");
                Map<String, Object> userMeta = user != null ? (Map<String, Object>) user.get("user_metadata") : Map.of();
                
                Map<String, Object> finalResponse = new HashMap<>();
                finalResponse.put("token", resBody.get("access_token"));
                finalResponse.put("userId", user != null ? user.get("id") : null);
                finalResponse.put("name", userMeta != null ? userMeta.getOrDefault("name", "Usuario") : "Usuario");
                finalResponse.put("email", request.getEmail());

                // Guardar/Actualizar Perfil local
                if (user != null) {
                    try {
                        com.rentshare.model.Profile profile = new com.rentshare.model.Profile();
                        profile.setId(UUID.fromString((String) user.get("id")));
                        profile.setName((String) finalResponse.get("name"));
                        profile.setUpdatedAt(java.time.ZonedDateTime.now());
                        profileRepository.save(profile);
                    } catch (Exception e) {
                        System.err.println("Advertencia: No se pudo sincronizar el perfil: " + e.getMessage());
                    }
                }

                return ResponseEntity.ok(finalResponse);
            }
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Credenciales inválidas"));
        } catch (HttpClientErrorException e) {
            return ResponseEntity.status(e.getStatusCode())
                    .body(Map.of("message", "Credenciales inválidas: " + e.getResponseBodyAsString()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error de autenticación: " + e.getMessage()));
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody AuthRequestDTO request) {
        RestTemplate restTemplate = new RestTemplate();
        String url = supabaseUrl + "/auth/v1/signup";
        
        Map<String, Object> options = new HashMap<>();
        options.put("data", Map.of("name", request.getName() != null ? request.getName() : "Usuario"));
        
        Map<String, Object> body = new HashMap<>();
        body.put("email", request.getEmail());
        body.put("password", request.getPassword());
        body.put("data", Map.of("name", request.getName() != null ? request.getName() : "Usuario"));

        try {
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, buildSupabaseHeaders());
            @SuppressWarnings("unchecked")
            ResponseEntity<Map<String, Object>> response = (ResponseEntity<Map<String, Object>>) (ResponseEntity<?>) restTemplate.postForEntity(url, entity, Map.class);

            Map<String, Object> resBody = response.getBody();
            if (resBody != null && resBody.containsKey("access_token")) {
                Map<String, Object> user = (Map<String, Object>) resBody.get("user");
                
                Map<String, Object> finalResponse = new HashMap<>();
                finalResponse.put("token", resBody.get("access_token"));
                finalResponse.put("userId", user != null ? user.get("id") : null);
                finalResponse.put("name", request.getName());
                finalResponse.put("email", request.getEmail());

                // Crear Perfil local (con protección contra errores de DB)
                try {
                    com.rentshare.model.Profile profile = new com.rentshare.model.Profile();
                    profile.setId(UUID.fromString((String) user.get("id")));
                    profile.setName(request.getName());
                    profile.setCreatedAt(java.time.ZonedDateTime.now());
                    profile.setUpdatedAt(java.time.ZonedDateTime.now());
                    profileRepository.save(profile);
                } catch (Exception e) {
                    System.err.println("Advertencia: No se pudo crear el perfil local: " + e.getMessage());
                    // Continuamos de todas formas para que el usuario pueda entrar
                }

                return ResponseEntity.status(HttpStatus.CREATED).body(finalResponse);
            }
            
            // Caso sin token inmediato
            Map<String, Object> idResponse = (Map<String, Object>) resBody;
            if (idResponse != null && idResponse.containsKey("id")) {
                try {
                    com.rentshare.model.Profile profile = new com.rentshare.model.Profile();
                    profile.setId(UUID.fromString((String) idResponse.get("id")));
                    profile.setName(request.getName());
                    profile.setCreatedAt(java.time.ZonedDateTime.now());
                    profile.setUpdatedAt(java.time.ZonedDateTime.now());
                    profileRepository.save(profile);
                } catch (Exception e) {
                    System.err.println("Advertencia: No se pudo crear el perfil local: " + e.getMessage());
                }
            }

            Map<String, Object> infoResponse = new HashMap<>();
            infoResponse.put("message", "Registro exitoso. Revisa tu correo para confirmar.");
            return ResponseEntity.ok(infoResponse);
        } catch (HttpClientErrorException e) {
            return ResponseEntity.status(e.getStatusCode())
                    .body(Map.of("message", "Error de registro: " + e.getResponseBodyAsString()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Error al registrar: " + e.getMessage()));
        }
    }
}
