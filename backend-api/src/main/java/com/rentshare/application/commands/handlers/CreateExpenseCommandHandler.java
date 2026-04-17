package com.rentshare.application.commands.handlers;

import com.rentshare.application.commands.CreateExpenseCommand;
import com.rentshare.application.events.EventStore;
import com.rentshare.application.events.ExpenseCreatedEvent;
import com.rentshare.model.Expense;
import com.rentshare.repository.ExpenseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class CreateExpenseCommandHandler {

    private final ExpenseRepository expenseRepository;
    private final EventStore eventStore;

    public Expense handle(CreateExpenseCommand command) {
        Expense expense = new Expense();
        expense.setDescripcion(command.getDescripcion());
        expense.setMonto(command.getMonto());
        expense.setFecha(command.getFecha());
        expense.setCategoria(command.getCategoria());
        expense.setTipo(command.getTipo());
        
        Expense savedExpense = expenseRepository.save(expense);

        // Publicar el evento
        ExpenseCreatedEvent event = ExpenseCreatedEvent.builder()
                .aggregateId(String.valueOf(savedExpense.getId()))
                .payload(savedExpense)
                .timestamp(LocalDateTime.now())
                .build();
                
        eventStore.appendEvent(event);

        return savedExpense;
    }
}
