package com.rentshare.api.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Data
public class CrearGastoRequest {
    @NotNull private UUID grupoId;
    @NotBlank @Size(max = 200) private String titulo;
    private String descripcion;
    @NotNull @DecimalMin("0.01") private BigDecimal monto;
    @NotBlank private String tipo;       // COMPARTIDO, INDIVIDUAL
    @NotBlank private String categoria;  // RENTA, SERVICIOS, MERCADO, LIMPIEZA, INTERNET, OTRO
    @NotNull private LocalDate fechaGasto;
    @NotEmpty private List<DivisionRequest> divisiones;

    @Data
    public static class DivisionRequest {
        @NotNull private UUID usuarioId;
        @NotNull @DecimalMin("0.01") private BigDecimal montoAsignado;
    }
}
