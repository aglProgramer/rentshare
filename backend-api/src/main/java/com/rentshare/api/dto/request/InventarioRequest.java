package com.rentshare.api.dto.request;

import lombok.Data;
import java.math.BigDecimal;
import java.util.UUID;

@Data
public class InventarioRequest {
    private UUID grupoId;
    private String nombre;
    private BigDecimal cantidad;
    private String unidad;
    private BigDecimal stockMinimo;
}
