package com.rentshare.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Entity
@Table(name = "app_groups")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HomeGroup {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String nombre;

    @Column(name = "presupuesto_total", precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal presupuestoTotal = BigDecimal.ZERO;

    @Column(name = "codigo_invitacion", nullable = false, unique = true, length = 10)
    private String codigoInvitacion;
}
