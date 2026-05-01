package com.rentshare.api.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "divisiones_gasto",
    uniqueConstraints = @UniqueConstraint(columnNames = {"gasto_id", "usuario_id"}))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class DivisionGasto {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "gasto_id", nullable = false)
    private Gasto gasto;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @Column(name = "monto_asignado", nullable = false, precision = 10, scale = 2)
    private BigDecimal montoAsignado;

    @Column
    private Boolean pagado = false;
}
