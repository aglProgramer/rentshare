package com.rentshare.api.dto.response;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class TareaResponse {
    private UUID id;
    private String titulo;
    private String descripcion;
    private LocalDateTime fechaVencimiento;
    private String estado;
    private String asignadoANombre;
    private UUID asignadoAId;
    private String creadoPorNombre;
    private LocalDateTime fechaCreacion;
}
