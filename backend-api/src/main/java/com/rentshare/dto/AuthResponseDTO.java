package com.rentshare.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AuthResponseDTO {
    private Long id;
    private String nombre;
    private String email;
    private String role;
    private Long homeGroupId;
    private String homeGroupNombre;
    private String inviteCode;
}
