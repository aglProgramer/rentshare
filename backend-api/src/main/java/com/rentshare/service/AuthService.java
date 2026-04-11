package com.rentshare.service;

import com.rentshare.dto.AuthResponseDTO;
import com.rentshare.dto.LoginRequestDTO;
import com.rentshare.dto.RegisterRequestDTO;
import com.rentshare.exception.BadRequestException;
import com.rentshare.exception.ResourceNotFoundException;
import com.rentshare.model.HomeGroup;
import com.rentshare.model.Role;
import com.rentshare.model.User;
import com.rentshare.repository.HomeGroupRepository;
import com.rentshare.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final HomeGroupRepository homeGroupRepository;

    @Transactional
    public AuthResponseDTO register(RegisterRequestDTO request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("El email ya está registrado");
        }

        HomeGroup finalGroup;
        Role role = Role.ADMIN; // El creador del grupo es ADMIN

        if (request.getInviteCode() != null && !request.getInviteCode().isBlank()) {
            finalGroup = homeGroupRepository.findByCodigoInvitacion(request.getInviteCode())
                    .orElseThrow(() -> new BadRequestException("Código de invitación inválido"));
            role = Role.MEMBER; // Si se une por código, es MEMBER
        } else {
            // Crea un grupo nuevo automáticamente con el nombre del usuario
            HomeGroup newGroup = new HomeGroup();
            newGroup.setNombre("Hogar de " + request.getNombre().split(" ")[0]);
            newGroup.setCodigoInvitacion(generarCodigo());
            finalGroup = homeGroupRepository.save(newGroup);
        }

        User user = User.builder()
                .nombre(request.getNombre())
                .email(request.getEmail())
                .password(request.getPassword()) // Demo: sin encriptar (simulación)
                .role(role)
                .homeGroup(finalGroup)
                .build();

        user = userRepository.save(user);

        return mapToResponse(user);
    }

    public AuthResponseDTO login(LoginRequestDTO request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("Usuario", "email", request.getEmail()));

        if (!user.getPassword().equals(request.getPassword())) {
            throw new BadRequestException("Contraseña incorrecta");
        }

        return mapToResponse(user);
    }

    private AuthResponseDTO mapToResponse(User user) {
        return AuthResponseDTO.builder()
                .id(user.getId())
                .nombre(user.getNombre())
                .email(user.getEmail())
                .role(user.getRole().name())
                .homeGroupId(user.getHomeGroup().getId())
                .homeGroupNombre(user.getHomeGroup().getNombre())
                .inviteCode(user.getHomeGroup().getCodigoInvitacion())
                .build();
    }

    private String generarCodigo() {
        return UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }
}
