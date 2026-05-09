package com.rentshare.api.repository;

import com.rentshare.api.model.Tarea;
import com.rentshare.api.model.Grupo;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface TareaRepository extends JpaRepository<Tarea, UUID> {
    // Métodos remotos
    Page<Tarea> findByGrupo(Grupo grupo, Pageable pageable);
    List<Tarea> findByGrupoAndEstado(Grupo grupo, String estado);
    List<Tarea> findByGrupoAndFechaVencimientoBefore(Grupo grupo, LocalDateTime fecha);
    Page<Tarea> findByGrupoAndEsRecurrenteTrue(Grupo grupo, Pageable pageable);

    // Métodos nuevos
    List<Tarea> findByGrupoId(UUID grupoId);
    Page<Tarea> findByGrupoId(UUID grupoId, Pageable pageable);
    List<Tarea> findByAsignadoAIdAndEstadoNot(UUID usuarioId, String estado);
}
