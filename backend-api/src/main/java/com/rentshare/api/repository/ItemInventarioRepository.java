package com.rentshare.api.repository;

import com.rentshare.api.model.ItemInventario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ItemInventarioRepository extends JpaRepository<ItemInventario, UUID> {
    List<ItemInventario> findByGrupoId(UUID grupoId);

    void deleteByGrupoId(UUID grupoId);
}
