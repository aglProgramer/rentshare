package com.rentshare.api.service;

import com.rentshare.api.dto.request.InventarioRequest;
import com.rentshare.api.dto.response.InventarioResponse;
import com.rentshare.api.model.Grupo;
import com.rentshare.api.model.ItemInventario;
import com.rentshare.api.repository.GrupoRepository;
import com.rentshare.api.repository.ItemInventarioRepository;
import com.rentshare.api.repository.MiembroGrupoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InventarioService {

    private final ItemInventarioRepository itemInventarioRepository;
    private final GrupoRepository grupoRepository;
    private final MiembroGrupoRepository miembroGrupoRepository;

    public List<InventarioResponse> listarPorGrupo(UUID grupoId) {
        return itemInventarioRepository.findByGrupoId(grupoId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public InventarioResponse guardar(InventarioRequest req, UUID usuarioId) {
        if (!miembroGrupoRepository.existsByGrupoIdAndUsuarioId(req.getGrupoId(), usuarioId)) {
            throw new RuntimeException("No eres miembro de este grupo");
        }

        Grupo grupo = grupoRepository.findById(req.getGrupoId())
                .orElseThrow(() -> new RuntimeException("Grupo no encontrado"));

        ItemInventario item = ItemInventario.builder()
                .grupo(grupo)
                .nombre(req.getNombre())
                .cantidad(req.getCantidad())
                .unidad(req.getUnidad())
                .stockMinimo(req.getStockMinimo())
                .build();

        return toResponse(itemInventarioRepository.save(item));
    }

    @Transactional
    public InventarioResponse actualizarCantidad(UUID itemId, BigDecimal cantidad, UUID usuarioId) {
        ItemInventario item = itemInventarioRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Item no encontrado"));

        if (!miembroGrupoRepository.existsByGrupoIdAndUsuarioId(item.getGrupo().getId(), usuarioId)) {
            throw new RuntimeException("No eres miembro de este grupo");
        }

        item.setCantidad(cantidad);
        return toResponse(itemInventarioRepository.save(item));
    }

    @Transactional
    public void eliminar(UUID itemId, UUID usuarioId) {
        ItemInventario item = itemInventarioRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Item no encontrado"));

        if (!miembroGrupoRepository.existsByGrupoIdAndUsuarioId(item.getGrupo().getId(), usuarioId)) {
            throw new RuntimeException("No eres miembro de este grupo");
        }

        itemInventarioRepository.delete(item);
    }

    private InventarioResponse toResponse(ItemInventario i) {
        return InventarioResponse.builder()
                .id(i.getId())
                .nombre(i.getNombre())
                .cantidad(i.getCantidad())
                .unidad(i.getUnidad())
                .stockMinimo(i.getStockMinimo())
                .ultimaActualizacion(i.getUltimaActualizacion())
                .build();
    }
}
