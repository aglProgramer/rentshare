package com.rentshare.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Notification {
    private String type;     // EXPENSE_CREATED, NOTIFICATION_PUSH
    private String message;
    private Object data;
    private LocalDateTime timestamp;
}
