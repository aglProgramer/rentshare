package com.rentshare.dto.response;

public record AuthResponse(String token, Long userId, String nombre, String email) {}
