package com.rentshare.api.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "gastos")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Gasto {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "grupo_id", nullable = false)
    private Grupo grupo;

    @Column(nullable = false, length = 200)
    private String titulo;

    @Column
    private String descripcion;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal monto;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pagado_por")
    private Usuario pagadoPor;

    @Column(length = 20)
    private String tipo; // COMPARTIDO, INDIVIDUAL

    @Column(length = 30)
    private String categoria; // RENTA, SERVICIOS, MERCADO, LIMPIEZA, INTERNET, OTRO

    @Column(name = "fecha_gasto")
    private LocalDate fechaGasto;

    @OneToMany(mappedBy = "gasto", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<DivisionGasto> divisiones;

    @CreationTimestamp
    @Column(name = "fecha_creacion", updatable = false)
    private LocalDateTime fechaCreacion;
}
