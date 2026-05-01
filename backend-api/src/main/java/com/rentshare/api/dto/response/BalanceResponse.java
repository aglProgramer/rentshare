package com.rentshare.api.dto.response;

import lombok.*;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class BalanceResponse {
    private UUID grupoId;
    private String grupoNombre;
    private BigDecimal totalGastos;
    private List<BalanceUsuario> balances;

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class BalanceUsuario {
        private UUID usuarioId;
        private String nombre;
        private BigDecimal totalPagado;    // cuánto pagó de su bolsillo
        private BigDecimal totalDebido;    // cuánto le corresponde pagar
        private BigDecimal balance;        // positivo = le deben, negativo = debe
    }
}
