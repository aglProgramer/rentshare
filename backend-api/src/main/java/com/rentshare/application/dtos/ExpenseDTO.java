package com.rentshare.application.dtos;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class ExpenseDTO {
    private Long id;
    private String descripcion;
    private BigDecimal monto;
    private String fecha;
    private String categoria;
    private String tipo;
    private Long pagadoPorId;
    private String pagadoPorNombre; // Información proyectada para lectura (Read Model)
    private Long grupoId;
}
