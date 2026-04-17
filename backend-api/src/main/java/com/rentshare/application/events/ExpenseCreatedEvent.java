package com.rentshare.application.events;

import com.rentshare.model.Expense;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

@Data
@EqualsAndHashCode(callSuper = true)
@SuperBuilder
@NoArgsConstructor
public class ExpenseCreatedEvent extends DomainEvent {
    
    private Expense payload;

    @Override
    public String getEventType() {
        return "ExpenseCreatedEvent";
    }
}
