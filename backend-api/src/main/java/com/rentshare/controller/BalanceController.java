package com.rentshare.controller;

import com.rentshare.dto.BalanceResponseDTO;
import com.rentshare.service.BalanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/groups")
@RequiredArgsConstructor
public class BalanceController {

    private final BalanceService balanceService;

    @GetMapping("/balance")
    public ResponseEntity<BalanceResponseDTO> getGroupBalance(
            @RequestHeader(value = "X-User-Id") Long userId) {
        return ResponseEntity.ok(balanceService.calcularBalance(userId));
    }
}
