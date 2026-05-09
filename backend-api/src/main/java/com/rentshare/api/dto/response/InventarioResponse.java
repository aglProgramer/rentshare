package com.rentshare.api.dto.response;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class InventarioResponse {
    private UUID id;
    private String nombre;
    private BigDecimal cantidad;
    private String unidad;
    private BigDecimal stockMinimo;
    private LocalDateTime ultimaActualizacion;
}
