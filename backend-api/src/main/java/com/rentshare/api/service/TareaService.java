package com.rentshare.api.service;

import com.rentshare.api.dto.request.TareaRequest;
import com.rentshare.api.dto.response.TareaResponse;
import com.rentshare.api.model.Grupo;
import com.rentshare.api.model.Tarea;
import com.rentshare.api.model.Usuario;
import com.rentshare.api.repository.GrupoRepository;
import com.rentshare.api.repository.MiembroGrupoRepository;
import com.rentshare.api.repository.TareaRepository;
import com.rentshare.api.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TareaService {

    private final TareaRepository tareaRepository;
    private final GrupoRepository grupoRepository;
    private final UsuarioRepository usuarioRepository;
    private final MiembroGrupoRepository miembroGrupoRepository;

    @Transactional(readOnly = true)
    public List<TareaResponse> listarPorGrupo(UUID grupoId) {
        return tareaRepository.findByGrupoId(grupoId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public TareaResponse crear(TareaRequest req, UUID creadorId) {
        Grupo grupo = grupoRepository.findById(req.getGrupoId())
                .orElseThrow(() -> new RuntimeException("Grupo no encontrado"));

        if (!miembroGrupoRepository.existsByGrupoIdAndUsuarioId(req.getGrupoId(), creadorId)) {
            throw new RuntimeException("No eres miembro de este grupo");
        }

        Usuario creadoPor = usuarioRepository.findById(creadorId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        Usuario asignadoA = null;
        if (req.getAsignadoAId() != null) {
            asignadoA = usuarioRepository.findById(req.getAsignadoAId())
                    .orElseThrow(() -> new RuntimeException("Usuario asignado no encontrado"));
        }

        Tarea tarea = Tarea.builder()
                .grupo(grupo)
                .titulo(req.getTitulo())
                .descripcion(req.getDescripcion())
                .fechaVencimiento(req.getFechaVencimiento())
                .estado("PENDIENTE")
                .creadoPor(creadoPor)
                .asignadoA(asignadoA)
                .build();

        return toResponse(tareaRepository.save(tarea));
    }

    @Transactional
    public TareaResponse cambiarEstado(UUID tareaId, String nuevoEstado, UUID usuarioId) {
        Tarea tarea = tareaRepository.findById(tareaId)
                .orElseThrow(() -> new RuntimeException("Tarea no encontrada"));

        // Verificar pertenencia al grupo
        if (!miembroGrupoRepository.existsByGrupoIdAndUsuarioId(tarea.getGrupo().getId(), usuarioId)) {
            throw new RuntimeException("No eres miembro de este grupo");
        }

        tarea.setEstado(nuevoEstado);
        return toResponse(tareaRepository.save(tarea));
    }

    @Transactional
    public void eliminar(UUID tareaId, UUID usuarioId) {
        Tarea tarea = tareaRepository.findById(tareaId)
                .orElseThrow(() -> new RuntimeException("Tarea no encontrada"));

        // Solo el creador o un ADMIN del grupo puede eliminar
        boolean esCreador = tarea.getCreadoPor().getId().equals(usuarioId);
        boolean esAdmin = miembroGrupoRepository.findByGrupoIdAndUsuarioId(tarea.getGrupo().getId(), usuarioId)
                .map(m -> "ADMIN".equals(m.getRol()))
                .orElse(false);

        if (!esCreador && !esAdmin) {
            throw new RuntimeException("No tienes permiso para eliminar esta tarea");
        }

        tareaRepository.delete(tarea);
    }

    private TareaResponse toResponse(Tarea t) {
        return TareaResponse.builder()
                .id(t.getId())
                .titulo(t.getTitulo())
                .descripcion(t.getDescripcion())
                .fechaVencimiento(t.getFechaVencimiento())
                .estado(t.getEstado())
                .asignadoANombre(t.getAsignadoA() != null ? t.getAsignadoA().getNombre() : "Sin asignar")
                .asignadoAId(t.getAsignadoA() != null ? t.getAsignadoA().getId() : null)
                .creadoPorNombre(t.getCreadoPor().getNombre())
                .fechaCreacion(t.getFechaCreacion())
                .build();
    }
}
