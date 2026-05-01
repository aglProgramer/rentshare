package com.rentshare.api.controller.v1;

import com.rentshare.api.dto.request.LoginRequest;
import com.rentshare.api.dto.request.RegisterRequest;
import com.rentshare.api.dto.response.AuthResponse;
import com.rentshare.api.dto.response.UsuarioResponse;
import com.rentshare.api.model.Usuario;
import com.rentshare.api.repository.UsuarioRepository;
import com.rentshare.api.security.JwtUtils;
import com.rentshare.api.security.CustomUserDetailsService;
import com.rentshare.api.service.UsuarioService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UsuarioService usuarioService;
    private final AuthenticationManager authenticationManager;
    private final CustomUserDetailsService userDetailsService;
    private final JwtUtils jwtUtils;
    private final UsuarioRepository usuarioRepository;

    @PostMapping("/register")
    public ResponseEntity<UsuarioResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(usuarioService.registrar(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        UserDetails userDetails = userDetailsService.loadUserByUsername(request.getEmail());
        String token = jwtUtils.generateToken(userDetails);
        
        Usuario usuario = usuarioRepository.findByEmail(request.getEmail()).orElseThrow();
        
        return ResponseEntity.ok(AuthResponse.builder()
                .token(token)
                .usuario(usuarioService.convertToResponse(usuario))
                .build());
    }
}
