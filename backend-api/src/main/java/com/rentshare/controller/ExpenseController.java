package com.rentshare.controller;

import com.rentshare.application.commands.CreateExpenseCommand;
import com.rentshare.application.commands.handlers.CreateExpenseCommandHandler;
import com.rentshare.application.dtos.ExpenseDTO;
import com.rentshare.application.queries.GetAllExpensesQuery;
import com.rentshare.application.queries.handlers.GetAllExpensesQueryHandler;
import com.rentshare.dto.Notification;
import com.rentshare.exception.ResourceNotFoundException;
import com.rentshare.model.Expense;
import com.rentshare.repository.ExpenseRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/expenses")
@RequiredArgsConstructor
@Tag(name = "Gastos (CQRS)", description = "Controlador que implementa el patrón CQRS para separar Comandos (Escrituras) de Consultas (Lecturas)")
public class ExpenseController {

    private final ExpenseRepository expenseRepository; // Todavía usado para DELETE
    private final SimpMessagingTemplate messagingTemplate;

    // CQRS Handlers
    private final CreateExpenseCommandHandler createExpenseHandler;
    private final GetAllExpensesQueryHandler getAllExpensesHandler;

    @GetMapping
    @Operation(summary = "Consultar Gastos (Query)", description = "Utiliza el QueryBus para devolver DTOs pre-proyectados sin invocar a las entidades JPA directamente.")
    public List<ExpenseDTO> getAllExpenses() {
        return getAllExpensesHandler.handle(GetAllExpensesQuery.builder().build());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener detalles de Gasto", description = "Recuperación clásica de gasto completo.")
    public Expense getExpenseById(@PathVariable Long id) {
        return expenseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Gasto no encontrado con id: " + id));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Crear Gasto (Command)", description = "Lanza un Comando que pasa por el Store de Eventos y dispara Broadcast vía WebSocket STOMP.")
    public Expense createExpense(@Valid @RequestBody CreateExpenseCommand command) {
        Expense savedExpense = createExpenseHandler.handle(command);
        
        Notification notification = Notification.builder()
                .type("EXPENSE_CREATED")
                .message("Nuevo gasto agregado: " + savedExpense.getDescripcion())
                .data(savedExpense)
                .timestamp(LocalDateTime.now())
                .build();
        
        messagingTemplate.convertAndSend("/topic/expenses", notification);
        
        return savedExpense;
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Eliminar Gasto (Command)", description = "Comando primitivo de eliminación")
    public void deleteExpense(@PathVariable Long id) {
        if (!expenseRepository.existsById(id)) {
            throw new ResourceNotFoundException("No se puede eliminar, ID no existe: " + id);
        }
        expenseRepository.deleteById(id);
    }
}

