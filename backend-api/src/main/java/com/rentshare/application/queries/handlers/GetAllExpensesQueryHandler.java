package com.rentshare.application.queries.handlers;

import com.rentshare.application.dtos.ExpenseDTO;
import com.rentshare.application.queries.GetAllExpensesQuery;
import com.rentshare.model.Expense;
import com.rentshare.repository.ExpenseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GetAllExpensesQueryHandler {

    private final ExpenseRepository expenseRepository;

    public List<ExpenseDTO> handle(GetAllExpensesQuery query) {
        // En una app CQRS pura o BD masiva, aquí usaríamos JdbcTemplate o Jooq
        // devolviendo directamente un DTO en vez de pasar por la entidad JPA para máxima velocidad.
        List<Expense> expenses = expenseRepository.findAll();
        
        return expenses.stream().map(e -> ExpenseDTO.builder()
                .id(e.getId())
                .descripcion(e.getDescripcion())
                .monto(e.getMonto())
                .fecha(e.getFecha() != null ? e.getFecha().toString() : null)
                .categoria(e.getCategoria() != null ? e.getCategoria().name() : null)
                .tipo(e.getTipo() != null ? e.getTipo().name() : null)
                .pagadoPorId(e.getPagadoPor() != null ? e.getPagadoPor().getId() : null)
                .pagadoPorNombre(e.getPagadoPor() != null ? e.getPagadoPor().getNombre() : "Desconocido")
                .grupoId(e.getGrupo() != null ? e.getGrupo().getId() : null)
                .build()
        ).collect(Collectors.toList());
    }
}
