package com.rentshare.repository;

import com.rentshare.model.Expense;
import com.rentshare.model.Categoria;
import com.rentshare.model.TipoGasto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ExpenseRepository extends JpaRepository<Expense, Long> {
    
    // Filtro por HomeGroup
    List<Expense> findAllByHomeGroupIdOrderByFechaDesc(Long homeGroupId);
    
    // Filtrar Gastos específicos del grupo
    List<Expense> findAllByHomeGroupIdAndTipo(Long homeGroupId, TipoGasto tipo);
    
    List<Expense> findByHomeGroupIdAndCategoriaOrderByFechaDesc(Long homeGroupId, Categoria categoria);
    
    List<Expense> findByHomeGroupIdAndFechaBetweenOrderByFechaDesc(Long homeGroupId, LocalDate inicio, LocalDate fin);
}
