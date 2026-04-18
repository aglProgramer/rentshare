package com.rentshare.controller;

import com.rentshare.dto.ExpenseRequestDTO;
import com.rentshare.model.Expense;
import com.rentshare.service.ExpenseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/expenses")
@RequiredArgsConstructor
public class ExpenseController {

    private final ExpenseService expenseService;

    @GetMapping
    public ResponseEntity<List<Expense>> getAllExpenses() {
        return ResponseEntity.ok(expenseService.getAllExpenses());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Expense> getExpenseById(@PathVariable UUID id) {
        return ResponseEntity.ok(expenseService.getExpenseById(id));
    }

    @PostMapping
    public ResponseEntity<Expense> createExpense(@RequestBody ExpenseRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(expenseService.createExpense(dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteExpense(@PathVariable UUID id) {
        expenseService.deleteExpense(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<Expense> updateExpense(@PathVariable UUID id, @RequestBody ExpenseRequestDTO dto) {
        return ResponseEntity.ok(expenseService.updateExpense(id, dto));
    }
}
