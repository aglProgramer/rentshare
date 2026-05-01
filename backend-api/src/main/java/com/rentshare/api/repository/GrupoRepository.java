package com.rentshare.api.repository;

import com.rentshare.api.model.Grupo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface GrupoRepository extends JpaRepository<Grupo, UUID> {
    @Query("SELECT g FROM Grupo g JOIN MiembroGrupo mg ON mg.grupo = g WHERE mg.usuario.id = :usuarioId")
    List<Grupo> findByMiembroUsuarioId(UUID usuarioId);
}
