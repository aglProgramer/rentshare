package com.rentshare.service;

import com.rentshare.model.Expense;
import com.rentshare.model.Split;
import com.rentshare.model.User;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Service
public class SplitCalculatorService {

    public List<Split> calcularSplitsAutomaticos(Expense expense, List<User> participantes) {
        if (participantes.isEmpty()) throw new IllegalArgumentException("Debe haber al menos un participante");
        
        BigDecimal montoPorPersona = expense.getMonto()
            .divide(BigDecimal.valueOf(participantes.size()), 2, RoundingMode.HALF_UP);
        
        return participantes.stream().map(usuario -> {
            Split split = new Split();
            split.setUser(usuario);
            split.setExpense(expense);
            split.setMontoDeuda(montoPorPersona);
            split.setPagado(false);
            return split;
        }).toList();
    }
}
