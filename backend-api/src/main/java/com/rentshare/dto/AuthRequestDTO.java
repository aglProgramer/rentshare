package com.rentshare.dto;

import lombok.Data;

@Data
public class AuthRequestDTO {
    private String email;
    private String password;
    private String name; // Solo para registro
}
