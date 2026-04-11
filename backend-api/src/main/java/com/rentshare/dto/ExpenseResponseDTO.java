package com.rentshare.dto;

import com.rentshare.model.Categoria;
import com.rentshare.model.TipoGasto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * DTO de respuesta para exponer información de un gasto al frontend.
 * Solo incluye campos seguros (nunca contraseñas ni datos sensibles).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExpenseResponseDTO {

    private Long id;
    private String descripcion;
    private BigDecimal monto;
    private LocalDate fecha;
    private Categoria categoria;
    private TipoGasto tipo;

    // Info del usuario que pagó (simplificada, sin password)
    private Long pagadoPorId;
    private String pagadoPorNombre;

    // Info del grupo (si existe)
    private Long grupoId;
    private String grupoNombre;
}
