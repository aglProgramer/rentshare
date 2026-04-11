package com.rentshare.dto;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;

@Data
@Builder
public class DeudaDTO {
    private String deudor; // Quien debe el dinero
    private String acreedor; // A quien se le debe el dinero
    private BigDecimal monto;
}
