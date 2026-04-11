package com.rentshare.service;

import com.rentshare.dto.BalanceResponseDTO;
import com.rentshare.dto.DeudaDTO;
import com.rentshare.model.Expense;
import com.rentshare.model.HomeGroup;
import com.rentshare.model.TipoGasto;
import com.rentshare.model.User;
import com.rentshare.repository.ExpenseRepository;
import com.rentshare.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;

@Service
@RequiredArgsConstructor
public class BalanceService {

    private final ExpenseRepository expenseRepository;
    private final UserRepository userRepository;

    public BalanceResponseDTO calcularBalance(Long userId) {
        User requester = userRepository.findById(userId).orElseThrow();
        HomeGroup group = requester.getHomeGroup();
        
        List<User> members = userRepository.findAllByHomeGroupId(group.getId());
        if (members.isEmpty()) return null;
        
        List<Expense> groupExpenses = expenseRepository.findAllByHomeGroupIdAndTipo(group.getId(), TipoGasto.UNIFICADO);
        
        BigDecimal totalGrupal = groupExpenses.stream()
                .map(Expense::getMonto)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
                
        if (totalGrupal.compareTo(BigDecimal.ZERO) == 0) {
            return BalanceResponseDTO.builder()
                .totalGrupal(BigDecimal.ZERO).tuAporte(BigDecimal.ZERO).tuBalance(BigDecimal.ZERO).detallesDeuda(Collections.emptyList())
                .build();
        }

        BigDecimal currentUserAporte = groupExpenses.stream()
                .filter(e -> e.getPagadoPor().getId().equals(userId))
                .map(Expense::getMonto)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
                
        BigDecimal fairShare = totalGrupal.divide(new BigDecimal(members.size()), 2, RoundingMode.HALF_UP);
        BigDecimal tuBalance = currentUserAporte.subtract(fairShare);
        
        // Calcular Balances Exactos
        Map<User, BigDecimal> balances = new HashMap<>();
        for (User u : members) {
            BigDecimal aporte = groupExpenses.stream()
                .filter(e -> e.getPagadoPor().getId().equals(u.getId()))
                .map(Expense::getMonto)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
            balances.put(u, aporte.subtract(fairShare));
        }
        
        // Algoritmo Goloso (Greedy) para Conciliación de Deuda
        List<DeudaDTO> detalles = new ArrayList<>();
        List<Map.Entry<User, BigDecimal>> debtors = new ArrayList<>();
        List<Map.Entry<User, BigDecimal>> creditors = new ArrayList<>();
        
        balances.entrySet().forEach(e -> {
            if (e.getValue().compareTo(BigDecimal.ZERO) < 0) debtors.add(e);
            else if (e.getValue().compareTo(BigDecimal.ZERO) > 0) creditors.add(e);
        });
        
        int d = 0, c = 0;
        while (d < debtors.size() && c < creditors.size()) {
            Map.Entry<User, BigDecimal> debtor = debtors.get(d);
            Map.Entry<User, BigDecimal> creditor = creditors.get(c);
            
            BigDecimal debtAmount = debtor.getValue().abs();
            BigDecimal creditAmount = creditor.getValue();
            
            BigDecimal settled = debtAmount.min(creditAmount);
            if (settled.compareTo(BigDecimal.ZERO) > 0) {
               detalles.add(DeudaDTO.builder()
                       .deudor(debtor.getKey().getNombre())
                       .acreedor(creditor.getKey().getNombre())
                       .monto(settled)
                       .build());
            }
            
            debtor.setValue(debtor.getValue().add(settled)); // Move towards 0
            creditor.setValue(creditor.getValue().subtract(settled)); // Move towards 0
            
            if (debtor.getValue().compareTo(BigDecimal.ZERO) == 0) d++;
            if (creditor.getValue().compareTo(BigDecimal.ZERO) == 0) c++;
        }
        
        return BalanceResponseDTO.builder()
            .totalGrupal(totalGrupal)
            .tuAporte(currentUserAporte)
            .tuBalance(tuBalance)
            .detallesDeuda(detalles)
            .build();
    }
}
