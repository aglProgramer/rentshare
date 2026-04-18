package com.rentshare.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Data
public class ExpenseRequestDTO {
    private String description;
    private BigDecimal amount;
    private LocalDate expenseDate;
    private String splitType;
    private UUID groupId;
    private UUID categoryId;
    private List<ParticipantDTO> participants;

    @Data
    public static class ParticipantDTO {
        private UUID profileId;
        private BigDecimal amountOwed;
    }
}
