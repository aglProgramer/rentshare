package com.rentshare.api.repository;

import com.rentshare.api.model.MiembroGrupo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface MiembroGrupoRepository extends JpaRepository<MiembroGrupo, UUID> {
    List<MiembroGrupo> findByGrupoId(UUID grupoId);
    Optional<MiembroGrupo> findByGrupoIdAndUsuarioId(UUID grupoId, UUID usuarioId);
    boolean existsByGrupoIdAndUsuarioId(UUID grupoId, UUID usuarioId);
}
