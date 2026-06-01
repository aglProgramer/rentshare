package com.rentshare.api.repository;

import com.rentshare.api.model.Gasto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface GastoRepository extends JpaRepository<Gasto, UUID> {
    Page<Gasto> findByGrupoId(UUID grupoId, Pageable pageable);

    Page<Gasto> findByGrupoIdAndCategoria(UUID grupoId, String categoria, Pageable pageable);

    void deleteByGrupoId(UUID grupoId);
}
