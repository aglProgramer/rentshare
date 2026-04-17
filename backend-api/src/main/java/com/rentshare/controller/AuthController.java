package com.rentshare.controller;

import com.rentshare.dto.request.LoginRequest;
import com.rentshare.dto.response.AuthResponse;
import com.rentshare.model.User;
import com.rentshare.repository.UserRepository;
import com.rentshare.exception.ResourceNotFoundException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserRepository userRepository;

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));
        
        // ⚠️ Para entrega académica: validación simple. En producción usar BCrypt
        if (!user.getPassword().equals(request.password())) {
            throw new IllegalArgumentException("Credenciales inválidas");
        }

        String token = UUID.randomUUID().toString(); // Mock token para sesión simple
        return ResponseEntity.ok(new AuthResponse(token, user.getId(), user.getNombre(), user.getEmail()));
    }
}
