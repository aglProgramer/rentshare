package com.rentshare.api.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "invitaciones_grupo")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class InvitacionGrupo {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "grupo_id", nullable = false)
    private Grupo grupo;

    @Column(nullable = false, unique = true, length = 64)
    private String codigo; // UUID v4 criptográficamente seguro

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "solicitante_id")
    private Usuario solicitante; // quien quiere unirse

    @Column(length = 20)
    private String estado; // PENDIENTE, ACEPTADA, RECHAZADA

    @Column(name = "fecha_expiracion")
    private LocalDateTime fechaExpiracion; // 24h de vida

    @CreationTimestamp
    @Column(name = "fecha_creacion", updatable = false)
    private LocalDateTime fechaCreacion;
}
