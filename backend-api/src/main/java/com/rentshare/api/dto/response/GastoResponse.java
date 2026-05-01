package com.rentshare.api.dto.response;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class GastoResponse {
    private UUID id;
    private UUID grupoId;
    private String titulo;
    private String descripcion;
    private BigDecimal monto;
    private String pagadoPorNombre;
    private UUID pagadoPorId;
    private String tipo;
    private String categoria;
    private LocalDate fechaGasto;
    private List<DivisionResponse> divisiones;
    private LocalDateTime fechaCreacion;

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class DivisionResponse {
        private UUID usuarioId;
        private String usuarioNombre;
        private BigDecimal montoAsignado;
        private Boolean pagado;
    }
}
