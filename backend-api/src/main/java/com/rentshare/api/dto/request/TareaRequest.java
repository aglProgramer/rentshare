package com.rentshare.api.dto.request;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class TareaRequest {
    private UUID grupoId;
    private String titulo;
    private String descripcion;
    private LocalDateTime fechaVencimiento;
    private UUID asignadoAId;
}
