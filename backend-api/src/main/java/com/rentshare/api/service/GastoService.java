package com.rentshare.api.service;

import com.rentshare.api.dto.request.CrearGastoRequest;
import com.rentshare.api.dto.response.GastoResponse;
import com.rentshare.api.model.*;
import com.rentshare.api.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class GastoService {

    private final GastoRepository gastoRepository;
    private final GrupoRepository grupoRepository;
    private final UsuarioRepository usuarioRepository;
    private final MiembroGrupoRepository miembroGrupoRepository;

    public Page<GastoResponse> listar(UUID grupoId, String categoria, Pageable pageable) {
        if (categoria != null && !categoria.isBlank()) {
            return gastoRepository.findByGrupoIdAndCategoria(grupoId, categoria, pageable)
                    .map(this::toResponse);
        }
        return gastoRepository.findByGrupoId(grupoId, pageable).map(this::toResponse);
    }

    @Transactional
    public GastoResponse crear(CrearGastoRequest req, UUID creadorId) {
        Grupo grupo = grupoRepository.findById(req.getGrupoId())
                .orElseThrow(() -> new RuntimeException("Grupo no encontrado"));

        // Verificar que es miembro
        if (!miembroGrupoRepository.existsByGrupoIdAndUsuarioId(req.getGrupoId(), creadorId)) {
            throw new RuntimeException("No eres miembro de este grupo");
        }

        Usuario pagadoPor = usuarioRepository.findById(creadorId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        Gasto gasto = Gasto.builder()
                .grupo(grupo)
                .titulo(req.getTitulo())
                .descripcion(req.getDescripcion())
                .monto(req.getMonto())
                .pagadoPor(pagadoPor)
                .tipo(req.getTipo())
                .categoria(req.getCategoria())
                .fechaGasto(req.getFechaGasto())
                .build();

        gasto = gastoRepository.save(gasto);

        // Guardar divisiones
        final Gasto gastoFinal = gasto;
        List<DivisionGasto> divisiones = req.getDivisiones().stream().map(d -> {
            Usuario u = usuarioRepository.findById(d.getUsuarioId())
                    .orElseThrow(() -> new RuntimeException("Usuario de división no encontrado: " + d.getUsuarioId()));
            return DivisionGasto.builder()
                    .gasto(gastoFinal)
                    .usuario(u)
                    .montoAsignado(d.getMontoAsignado())
                    .pagado(u.getId().equals(creadorId)) // quien pagó ya liquidó su parte
                    .build();
        }).collect(Collectors.toList());

        gasto.setDivisiones(divisiones);
        gasto = gastoRepository.save(gasto);

        log.info("Gasto creado: {} en grupo {}", gasto.getTitulo(), grupo.getNombre());
        return toResponse(gasto);
    }

    @Transactional
    public void eliminar(UUID gastoId, UUID usuarioId) {
        Gasto gasto = gastoRepository.findById(gastoId)
                .orElseThrow(() -> new RuntimeException("Gasto no encontrado"));

        boolean esPagador = gasto.getPagadoPor().getId().equals(usuarioId);
        MiembroGrupo m = miembroGrupoRepository
                .findByGrupoIdAndUsuarioId(gasto.getGrupo().getId(), usuarioId)
                .orElseThrow(() -> new RuntimeException("No eres miembro del grupo"));

        if (!esPagador && !"ADMIN".equals(m.getRol())) {
            throw new RuntimeException("Solo el pagador o el admin puede eliminar este gasto");
        }

        gastoRepository.delete(gasto);
    }

    @Transactional
    public GastoResponse marcarDivisionPagada(UUID gastoId, UUID usuarioId) {
        Gasto gasto = gastoRepository.findById(gastoId)
                .orElseThrow(() -> new RuntimeException("Gasto no encontrado"));

        gasto.getDivisiones().stream()
                .filter(d -> d.getUsuario().getId().equals(usuarioId))
                .findFirst()
                .ifPresent(d -> d.setPagado(true));

        return toResponse(gastoRepository.save(gasto));
    }

    public com.rentshare.api.dto.response.StatsResponse obtenerStats(UUID grupoId) {
        List<Gasto> gastos = gastoRepository.findAll().stream()
                .filter(g -> g.getGrupo().getId().equals(grupoId))
                .collect(Collectors.toList());

        java.math.BigDecimal total = gastos.stream()
                .map(Gasto::getMonto)
                .reduce(java.math.BigDecimal.ZERO, java.math.BigDecimal::add);

        java.util.Map<String, java.math.BigDecimal> porCat = gastos.stream()
                .collect(Collectors.groupingBy(
                        Gasto::getCategoria,
                        Collectors.reducing(java.math.BigDecimal.ZERO, Gasto::getMonto, java.math.BigDecimal::add)
                ));

        java.util.Map<String, java.math.BigDecimal> porUsuario = gastos.stream()
                .collect(Collectors.groupingBy(
                        g -> g.getPagadoPor().getNombre(),
                        Collectors.reducing(java.math.BigDecimal.ZERO, Gasto::getMonto, java.math.BigDecimal::add)
                ));

        return com.rentshare.api.dto.response.StatsResponse.builder()
                .totalGastado(total)
                .gastosPorCategoria(porCat)
                .gastosPorUsuario(porUsuario)
                .build();
    }

    private GastoResponse toResponse(Gasto g) {
        List<GastoResponse.DivisionResponse> divs = g.getDivisiones() == null ? List.of() :
                g.getDivisiones().stream().map(d -> GastoResponse.DivisionResponse.builder()
                        .usuarioId(d.getUsuario().getId())
                        .usuarioNombre(d.getUsuario().getNombre())
                        .montoAsignado(d.getMontoAsignado())
                        .pagado(d.getPagado())
                        .build()).collect(Collectors.toList());

        return GastoResponse.builder()
                .id(g.getId())
                .grupoId(g.getGrupo().getId())
                .titulo(g.getTitulo())
                .descripcion(g.getDescripcion())
                .monto(g.getMonto())
                .pagadoPorNombre(g.getPagadoPor() != null ? g.getPagadoPor().getNombre() : "—")
                .pagadoPorId(g.getPagadoPor() != null ? g.getPagadoPor().getId() : null)
                .tipo(g.getTipo())
                .categoria(g.getCategoria())
                .fechaGasto(g.getFechaGasto())
                .divisiones(divs)
                .fechaCreacion(g.getFechaCreacion())
                .build();
    }
}
