package com.rentshare.api.dto.response;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.util.Map;

@Data
@Builder
public class StatsResponse {
    private BigDecimal totalGastado;
    private Map<String, BigDecimal> gastosPorCategoria;
    private Map<String, BigDecimal> gastosPorUsuario;
}
