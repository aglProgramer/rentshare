package com.rentshare.api.service;

import com.rentshare.api.dto.request.RegisterRequest;
import com.rentshare.api.dto.response.UsuarioResponse;
import com.rentshare.api.model.Usuario;
import com.rentshare.api.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public Page<UsuarioResponse> listarTodos(Pageable pageable) {
        log.info("Fetching paginated users: {}", pageable);
        return usuarioRepository.findAll(pageable)
                .map(this::convertToResponse);
    }

    @Transactional
    public UsuarioResponse registrar(RegisterRequest request) {
        log.info("Registering new user with email: {}", request.getEmail());
        
        if (usuarioRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("El email ya está registrado");
        }

        Usuario usuario = Usuario.builder()
                .nombre(request.getNombre())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .rol("USER")
                .build();

        Usuario guardado = usuarioRepository.save(usuario);
        return convertToResponse(guardado);
    }

    public UsuarioResponse convertToResponse(Usuario usuario) {
        return UsuarioResponse.builder()
                .id(usuario.getId())
                .nombre(usuario.getNombre())
                .email(usuario.getEmail())
                .rol(usuario.getRol())
                .fechaCreacion(usuario.getFechaCreacion())
                .build();
    }
}
