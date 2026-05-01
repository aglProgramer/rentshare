package com.rentshare.api.dto.response;

import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class GrupoResponse {
    private UUID id;
    private String nombre;
    private String descripcion;
    private String creadorNombre;
    private String rolActual; // rol del usuario autenticado en este grupo
    private int totalMiembros;
    private LocalDateTime fechaCreacion;
}
