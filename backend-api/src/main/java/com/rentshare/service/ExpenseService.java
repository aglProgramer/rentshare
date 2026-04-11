package com.rentshare.service;

import com.rentshare.dto.ExpenseRequestDTO;
import com.rentshare.dto.ExpenseResponseDTO;
import com.rentshare.exception.BadRequestException;
import com.rentshare.exception.ResourceNotFoundException;
import com.rentshare.model.*;
import com.rentshare.repository.ExpenseRepository;
import com.rentshare.repository.HomeGroupRepository;
import com.rentshare.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ExpenseService {

    private final ExpenseRepository expenseRepository;
    private final UserRepository userRepository;
    private final HomeGroupRepository homeGroupRepository;

    public List<ExpenseResponseDTO> listarTodos(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario", "id", userId));
                
        return expenseRepository.findAllByHomeGroupIdOrderByFechaDesc(user.getHomeGroup().getId())
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public ExpenseResponseDTO obtenerPorId(Long id, Long userId) {
        Expense expense = expenseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Gasto", "id", id));
        
        User user = userRepository.findById(userId).orElseThrow();
        if (!expense.getHomeGroup().getId().equals(user.getHomeGroup().getId())) {
             throw new BadRequestException("Acceso denegado a este gasto");
        }
        
        return mapToDTO(expense);
    }

    @Transactional
    public ExpenseResponseDTO crearGasto(ExpenseRequestDTO request, Long userId) {
        User creador = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario", "id", userId));

        HomeGroup homeGroup = creador.getHomeGroup();

        Expense expense = Expense.builder()
                .descripcion(request.getDescripcion())
                .monto(request.getMonto())
                .fecha(request.getFecha())
                .categoria(request.getCategoria())
                .tipo(request.getTipo())
                .pagadoPor(creador)
                .homeGroup(homeGroup)
                .build();

        if (request.getTipo() == TipoGasto.UNIFICADO) {
            // El HomeGroup es el mismo de todos los miembros - en un app real, traeríamos todos los usuarios del grupo
            // Para simplicidad, agregaremos el Split solo al creador por ahora o simular división equitativa
            Split split = Split.builder()
                    .expense(expense)
                    .user(creador)
                    .montoAsignado(request.getMonto()) // Simplificado para que compile, ideal: dividir entre miembros del select
                    .pagado(true)
                    .build();
            expense.getSplits().add(split);
        } else {
            Split split = Split.builder()
                    .expense(expense)
                    .user(creador)
                    .montoAsignado(request.getMonto())
                    .pagado(true)
                    .build();
            expense.getSplits().add(split);
        }

        expense = expenseRepository.save(expense);
        return mapToDTO(expense);
    }

    @Transactional
    public ExpenseResponseDTO actualizarGasto(Long id, ExpenseRequestDTO request, Long userId) {
        Expense expense = expenseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Gasto", "id", id));
                
        User user = userRepository.findById(userId).orElseThrow();
        if (!expense.getHomeGroup().getId().equals(user.getHomeGroup().getId())) {
             throw new BadRequestException("Acceso denegado a este gasto");
        }
        
        if (!expense.getPagadoPor().getId().equals(userId) && user.getRole() != Role.ADMIN) {
             throw new BadRequestException("No tienes permisos para editar este gasto");
        }
        
        expense.setDescripcion(request.getDescripcion());
        expense.setMonto(request.getMonto());
        expense.setFecha(request.getFecha());
        expense.setCategoria(request.getCategoria());
        expense.setTipo(request.getTipo());
        
        expense = expenseRepository.save(expense);
        return mapToDTO(expense);
    }

    @Transactional
    public void eliminarGasto(Long id, Long userId) {
        Expense expense = expenseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Gasto", "id", id));
        
        User user = userRepository.findById(userId).orElseThrow();
        
        if (!expense.getHomeGroup().getId().equals(user.getHomeGroup().getId())) {
            throw new BadRequestException("Acceso denegado a este grupo");
        }
        
        // Solo el creador o un ADMIN puede borrar
        if (!expense.getPagadoPor().getId().equals(userId) && user.getRole() != Role.ADMIN) {
            throw new BadRequestException("No tienes permisos para eliminar este gasto");
        }

        expenseRepository.delete(expense);
    }

    private ExpenseResponseDTO mapToDTO(Expense expense) {
        return ExpenseResponseDTO.builder()
                .id(expense.getId())
                .descripcion(expense.getDescripcion())
                .monto(expense.getMonto())
                .fecha(expense.getFecha())
                .categoria(expense.getCategoria())
                .tipo(expense.getTipo())
                .pagadoPorNombre(expense.getPagadoPor().getNombre())
                .pagadoPorId(expense.getPagadoPor().getId())
                .build();
    }
}
