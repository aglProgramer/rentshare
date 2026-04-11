package com.rentshare.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * Representa la división de un gasto entre un usuario específico.
 * Esta es la tabla clave que permite saber cuánto le toca pagar
 * a cada integrante de un gasto unificado.
 */
@Entity
@Table(name = "splits")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Split {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Gasto al que pertenece esta división */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "expense_id", nullable = false)
    private Expense expense;

    /** Usuario responsable de pagar este fragmento */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    /** Monto asignado a este usuario para este gasto */
    @Column(name = "monto_asignado", nullable = false, precision = 15, scale = 2)
    private BigDecimal montoAsignado;

    /** Indica si el usuario ya realizó el pago de su parte */
    @Column(nullable = false)
    private Boolean pagado = false;
}
