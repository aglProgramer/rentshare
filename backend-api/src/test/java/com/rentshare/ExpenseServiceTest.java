package com.rentshare;

import com.rentshare.dto.ExpenseRequestDTO;
import com.rentshare.dto.ExpenseResponseDTO;
import com.rentshare.exception.ResourceNotFoundException;
import com.rentshare.model.*;
import com.rentshare.repository.ExpenseRepository;
import com.rentshare.repository.GroupRepository;
import com.rentshare.repository.UserRepository;
import com.rentshare.service.ExpenseService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Tests unitarios para ExpenseService.
 * Usa Mockito para aislar las dependencias (repositorios).
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("ExpenseService — Tests Unitarios")
class ExpenseServiceTest {

    @Mock private ExpenseRepository expenseRepository;
    @Mock private UserRepository    userRepository;
    @Mock private GroupRepository   groupRepository;

    @InjectMocks
    private ExpenseService expenseService;

    private User   testUser;
    private Group  testGroup;
    private Expense testExpense;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .id(1L)
                .nombre("Carlos Rodríguez")
                .email("carlos@rentshare.com")
                .password("hash")
                .build();

        testGroup = Group.builder()
                .id(1L)
                .nombre("Apartamento 402")
                .presupuestoTotal(new BigDecimal("2500000"))
                .build();

        testExpense = Expense.builder()
                .id(1L)
                .descripcion("Arriendo de abril")
                .monto(new BigDecimal("850000"))
                .fecha(LocalDate.of(2026, 4, 1))
                .categoria(Categoria.RENTA)
                .tipo(TipoGasto.UNIFICADO)
                .pagadoPor(testUser)
                .grupo(testGroup)
                .build();
    }

    // =========================================================
    // Test: Listar gastos
    // =========================================================
    @Test
    @DisplayName("listarTodos() debe retornar lista de gastos como DTOs")
    void testListarTodos() {
        when(expenseRepository.findAllByOrderByFechaDesc())
                .thenReturn(List.of(testExpense));

        List<ExpenseResponseDTO> result = expenseService.listarTodos();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getDescripcion()).isEqualTo("Arriendo de abril");
        assertThat(result.get(0).getMonto()).isEqualByComparingTo("850000");
        verify(expenseRepository, times(1)).findAllByOrderByFechaDesc();
    }

    // =========================================================
    // Test: Crear gasto exitoso
    // =========================================================
    @Test
    @DisplayName("crearGasto() debe persistir y retornar el gasto creado")
    void testCrearGastoExitoso() {
        ExpenseRequestDTO dto = ExpenseRequestDTO.builder()
                .descripcion("Factura de luz")
                .monto(new BigDecimal("125000"))
                .fecha(LocalDate.now())
                .categoria(Categoria.SERVICIO)
                .tipo(TipoGasto.UNIFICADO)
                .pagadoPorId(1L)
                .grupoId(1L)
                .build();

        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(groupRepository.findById(1L)).thenReturn(Optional.of(testGroup));
        when(expenseRepository.save(any(Expense.class))).thenReturn(testExpense);

        ExpenseResponseDTO result = expenseService.crearGasto(dto);

        assertThat(result).isNotNull();
        assertThat(result.getPagadoPorNombre()).isEqualTo("Carlos Rodríguez");
        verify(expenseRepository, times(1)).save(any(Expense.class));
    }

    // =========================================================
    // Test: Crear gasto con usuario inexistente → 404
    // =========================================================
    @Test
    @DisplayName("crearGasto() debe lanzar ResourceNotFoundException si el usuario no existe")
    void testCrearGastoUsuarioInexistente() {
        ExpenseRequestDTO dto = ExpenseRequestDTO.builder()
                .descripcion("Algún gasto")
                .monto(new BigDecimal("50000"))
                .fecha(LocalDate.now())
                .categoria(Categoria.OTRO)
                .tipo(TipoGasto.INDIVIDUAL)
                .pagadoPorId(99L)
                .build();

        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> expenseService.crearGasto(dto))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("99");

        verify(expenseRepository, never()).save(any());
    }

    // =========================================================
    // Test: Obtener por ID inexistente → 404
    // =========================================================
    @Test
    @DisplayName("obtenerPorId() debe lanzar ResourceNotFoundException para ID inexistente")
    void testObtenerPorIdInexistente() {
        when(expenseRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> expenseService.obtenerPorId(999L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("999");
    }

    // =========================================================
    // Test: Eliminar gasto inexistente → 404
    // =========================================================
    @Test
    @DisplayName("eliminarGasto() debe lanzar ResourceNotFoundException si no existe")
    void testEliminarGastoInexistente() {
        when(expenseRepository.existsById(999L)).thenReturn(false);

        assertThatThrownBy(() -> expenseService.eliminarGasto(999L))
                .isInstanceOf(ResourceNotFoundException.class);

        verify(expenseRepository, never()).deleteById(any());
    }
}
