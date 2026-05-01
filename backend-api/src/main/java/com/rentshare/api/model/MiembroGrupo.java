package com.rentshare.api.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "miembros_grupo",
    uniqueConstraints = @UniqueConstraint(columnNames = {"grupo_id", "usuario_id"}))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class MiembroGrupo {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "grupo_id", nullable = false)
    private Grupo grupo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @Column(length = 20)
    private String rol; // ADMIN, MEMBER

    @CreationTimestamp
    @Column(name = "fecha_union", updatable = false)
    private LocalDateTime fechaUnion;
}
