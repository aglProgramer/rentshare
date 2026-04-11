package com.rentshare.controller;

import com.rentshare.dto.ExpenseRequestDTO;
import com.rentshare.dto.ExpenseResponseDTO;
import com.rentshare.service.ExpenseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/expenses")
@RequiredArgsConstructor
public class ExpenseController {

    private final ExpenseService expenseService;

    @GetMapping
    public ResponseEntity<List<ExpenseResponseDTO>> listarGastos(
            @RequestHeader(value = "X-User-Id", required = false) Long userId) {
        if (userId == null) {
            // Permanece para dar soporte a la versión antigua offline temporalmente si no manda el ID
            return ResponseEntity.ok(expenseService.listarTodos(1L)); 
        }
        return ResponseEntity.ok(expenseService.listarTodos(userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ExpenseResponseDTO> obtenerGastoPorId(
            @PathVariable Long id, @RequestHeader(value = "X-User-Id") Long userId) {
        return ResponseEntity.ok(expenseService.obtenerPorId(id, userId));
    }

    @PostMapping
    public ResponseEntity<ExpenseResponseDTO> crearGasto(
            @Valid @RequestBody ExpenseRequestDTO request,
            @RequestHeader(value = "X-User-Id") Long userId) {
        return ResponseEntity.status(HttpStatus.CREATED).body(expenseService.crearGasto(request, userId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ExpenseResponseDTO> actualizarGasto(
            @PathVariable Long id,
            @Valid @RequestBody ExpenseRequestDTO request,
            @RequestHeader(value = "X-User-Id") Long userId) {
        return ResponseEntity.ok(expenseService.actualizarGasto(id, request, userId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarGasto(
            @PathVariable Long id, @RequestHeader(value = "X-User-Id") Long userId) {
        expenseService.eliminarGasto(id, userId);
        return ResponseEntity.noContent().build();
    }
}
