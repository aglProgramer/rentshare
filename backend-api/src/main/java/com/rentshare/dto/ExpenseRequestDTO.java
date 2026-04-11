package com.rentshare.dto;

import com.rentshare.model.Categoria;
import com.rentshare.model.TipoGasto;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * DTO para crear o actualizar un gasto.
 * Evita exponer directamente la entidad de base de datos.
 * Incluye validaciones exhaustivas con Bean Validation.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExpenseRequestDTO {

    @NotBlank(message = "La descripción del gasto es obligatoria")
    @Size(min = 3, max = 200, message = "La descripción debe tener entre 3 y 200 caracteres")
    private String descripcion;

    @NotNull(message = "El monto es obligatorio")
    @DecimalMin(value = "0.01", message = "El monto debe ser mayor a cero")
    @Digits(integer = 13, fraction = 2, message = "El monto no tiene un formato válido")
    private BigDecimal monto;

    @NotNull(message = "La fecha del gasto es obligatoria")
    @PastOrPresent(message = "La fecha no puede ser futura")
    private LocalDate fecha;

    @NotNull(message = "La categoría es obligatoria (RENTA, SERVICIO, MERCADO, OTRO)")
    private Categoria categoria;

    @NotNull(message = "El tipo es obligatorio (INDIVIDUAL, UNIFICADO)")
    private TipoGasto tipo;

    @NotNull(message = "El ID del usuario que pagó es obligatorio")
    @Positive(message = "El ID del usuario debe ser un número positivo")
    private Long pagadoPorId;

    @Positive(message = "El ID del grupo debe ser un número positivo")
    private Long grupoId; // Opcional para gastos individuales
}
