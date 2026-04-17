package com.rentshare.application.queries;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class GetAllExpensesQuery {
    private Long groupId; // Opcional, para filtrar por grupo si es necesario
}
