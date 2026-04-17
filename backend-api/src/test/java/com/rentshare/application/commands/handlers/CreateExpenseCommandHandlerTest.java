package com.rentshare.application.commands.handlers;

import com.rentshare.application.commands.CreateExpenseCommand;
import com.rentshare.application.events.EventStore;
import com.rentshare.application.events.ExpenseCreatedEvent;
import com.rentshare.model.Category;
import com.rentshare.model.Expense;
import com.rentshare.model.Tipo;
import com.rentshare.repository.ExpenseRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class CreateExpenseCommandHandlerTest {

    @Mock
    private ExpenseRepository expenseRepository;

    @Mock
    private EventStore eventStore;

    @InjectMocks
    private CreateExpenseCommandHandler handler;

    private CreateExpenseCommand validCommand;

    @BeforeEach
    void setUp() {
        validCommand = CreateExpenseCommand.builder()
                .descripcion("Factura de Internet")
                .monto(new BigDecimal("85000.00"))
                .fecha(LocalDate.now())
                .categoria(Category.SERVICIO)
                .tipo(Tipo.UNIFICADO)
                .pagadoPorId(1L)
                .build();
    }

    @Test
    void shouldCreateExpenseAndPublishEvent() {
        // Arrange
        Expense savedExpense = new Expense();
        savedExpense.setId(10L);
        savedExpense.setDescripcion(validCommand.getDescripcion());
        
        when(expenseRepository.save(any(Expense.class))).thenReturn(savedExpense);

        // Act
        Expense result = handler.handle(validCommand);

        // Assert
        assertNotNull(result);
        assertEquals(10L, result.getId());

        // Verificar que se guardó en la DB
        verify(expenseRepository).save(any(Expense.class));

        // Verificar Event Sourcing: se debió emitir un evento
        ArgumentCaptor<ExpenseCreatedEvent> eventCaptor = ArgumentCaptor.forClass(ExpenseCreatedEvent.class);
        verify(eventStore).appendEvent(eventCaptor.capture());

        ExpenseCreatedEvent emittedEvent = eventCaptor.getValue();
        assertEquals("10", emittedEvent.getAggregateId());
        assertEquals("Factura de Internet", emittedEvent.getPayload().getDescripcion());
        assertEquals("ExpenseCreatedEvent", emittedEvent.getEventType());
    }
}
