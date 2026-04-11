package com.rentshare.dto;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
public class BalanceResponseDTO {
    private BigDecimal totalGrupal;   // Suma de gastos unificados
    private BigDecimal tuAporte;      // Cuánto has pagado tú de gastos unificados
    private BigDecimal tuBalance;     // Diferencia (Positivo: te deben, Negativo: debes pagar)
    private List<DeudaDTO> detallesDeuda; // Instrucciones exactas de quién le paga a quién
}
