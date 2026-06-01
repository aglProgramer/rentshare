package com.rentshare.api.repository;

import com.rentshare.api.model.InvitacionGrupo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface InvitacionGrupoRepository extends JpaRepository<InvitacionGrupo, UUID> {
    Optional<InvitacionGrupo> findByCodigo(String codigo);

    List<InvitacionGrupo> findByGrupoIdAndEstado(UUID grupoId, String estado);

    void deleteByGrupoId(UUID grupoId);
}
