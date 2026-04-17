package com.rentshare.application.commands;

import com.rentshare.model.Category;
import com.rentshare.model.Tipo;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
public class CreateExpenseCommand {
    @NotBlank(message = "La descripción no puede estar vacía")
    private String descripcion;

    @NotNull(message = "El monto es requerido")
    @DecimalMin(value = "0.01", message = "El monto debe ser mayor a cero")
    private BigDecimal monto;

    @NotNull(message = "La fecha es requerida")
    private LocalDate fecha;

    @NotNull(message = "La categoría es requerida")
    private Category categoria;

    @NotNull(message = "El tipo es requerido")
    private Tipo tipo;

    @NotNull(message = "El ID de quien paga es requerido")
    private Long pagadoPorId;
    
    private Long grupoId; // Puede ser nulo si es individual puro (aunque la lógica del dominio exige validación)
}
