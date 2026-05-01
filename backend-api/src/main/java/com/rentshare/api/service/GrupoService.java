package com.rentshare.api.service;

import com.rentshare.api.dto.request.CrearGrupoRequest;
import com.rentshare.api.dto.response.BalanceResponse;
import com.rentshare.api.dto.response.GrupoResponse;
import com.rentshare.api.dto.response.UsuarioResponse;
import com.rentshare.api.model.*;
import com.rentshare.api.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class GrupoService {

    private final GrupoRepository grupoRepository;
    private final MiembroGrupoRepository miembroGrupoRepository;
    private final InvitacionGrupoRepository invitacionGrupoRepository;
    private final UsuarioRepository usuarioRepository;
    private final GastoRepository gastoRepository;

    @Transactional
    public GrupoResponse crear(CrearGrupoRequest req, UUID creadorId) {
        Usuario creador = usuarioRepository.findById(creadorId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        Grupo grupo = Grupo.builder()
                .nombre(req.getNombre())
                .descripcion(req.getDescripcion())
                .creador(creador)
                .build();
        grupo = grupoRepository.save(grupo);

        // El creador es ADMIN del grupo automáticamente
        MiembroGrupo miembro = MiembroGrupo.builder()
                .grupo(grupo)
                .usuario(creador)
                .rol("ADMIN")
                .build();
        miembroGrupoRepository.save(miembro);

        log.info("Group created: {} by {}", grupo.getNombre(), creador.getEmail());
        return toResponse(grupo, "ADMIN", 1);
    }

    public List<GrupoResponse> misGrupos(UUID usuarioId) {
        List<Grupo> grupos = grupoRepository.findByMiembroUsuarioId(usuarioId);
        return grupos.stream().map(g -> {
            List<MiembroGrupo> miembros = miembroGrupoRepository.findByGrupoId(g.getId());
            String rol = miembros.stream()
                    .filter(m -> m.getUsuario().getId().equals(usuarioId))
                    .map(MiembroGrupo::getRol)
                    .findFirst().orElse("MEMBER");
            return toResponse(g, rol, miembros.size());
        }).collect(Collectors.toList());
    }

    public List<UsuarioResponse> miembros(UUID grupoId) {
        return miembroGrupoRepository.findByGrupoId(grupoId).stream()
                .map(m -> UsuarioResponse.builder()
                        .id(m.getUsuario().getId())
                        .nombre(m.getUsuario().getNombre())
                        .email(m.getUsuario().getEmail())
                        .rol(m.getRol())
                        .fechaCreacion(m.getUsuario().getFechaCreacion())
                        .build())
                .collect(Collectors.toList());
    }

    /**
     * El admin genera un código de invitación seguro (UUID)
     * Solo el admin del grupo puede generarlo.
     */
    @Transactional
    public String generarCodigoInvitacion(UUID grupoId, UUID adminId) {
        verificarAdmin(grupoId, adminId);
        // Código criptográficamente seguro: UUID v4 
        String codigo = UUID.randomUUID().toString().replace("-", "");
        Grupo grupo = grupoRepository.findById(grupoId)
                .orElseThrow(() -> new RuntimeException("Grupo no encontrado"));

        InvitacionGrupo inv = InvitacionGrupo.builder()
                .grupo(grupo)
                .codigo(codigo)
                .estado("GENERADO") // aún no tiene solicitante
                .fechaExpiracion(LocalDateTime.now().plusHours(24))
                .build();
        invitacionGrupoRepository.save(inv);
        return codigo;
    }

    /**
     * El usuario ingresa el código y solicita unirse
     */
    @Transactional
    public void solicitarUnion(String codigo, UUID solicitanteId) {
        InvitacionGrupo inv = invitacionGrupoRepository.findByCodigo(codigo)
                .orElseThrow(() -> new RuntimeException("Código de invitación inválido"));

        if (!"GENERADO".equals(inv.getEstado())) {
            throw new RuntimeException("Este código ya fue usado o expiró");
        }
        if (inv.getFechaExpiracion() != null && inv.getFechaExpiracion().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("El código de invitación ha expirado");
        }

        Usuario solicitante = usuarioRepository.findById(solicitanteId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        if (miembroGrupoRepository.existsByGrupoIdAndUsuarioId(inv.getGrupo().getId(), solicitanteId)) {
            throw new RuntimeException("Ya eres miembro de este grupo");
        }

        inv.setSolicitante(solicitante);
        inv.setEstado("PENDIENTE");
        invitacionGrupoRepository.save(inv);
    }

    /**
     * Admin aprueba o rechaza una solicitud de unión
     */
    @Transactional
    public void responderSolicitud(UUID invitacionId, boolean aceptar, UUID adminId) {
        InvitacionGrupo inv = invitacionGrupoRepository.findById(invitacionId)
                .orElseThrow(() -> new RuntimeException("Solicitud no encontrada"));

        verificarAdmin(inv.getGrupo().getId(), adminId);

        if (!"PENDIENTE".equals(inv.getEstado())) {
            throw new RuntimeException("Esta solicitud ya fue procesada");
        }

        if (aceptar) {
            MiembroGrupo nuevo = MiembroGrupo.builder()
                    .grupo(inv.getGrupo())
                    .usuario(inv.getSolicitante())
                    .rol("MEMBER")
                    .build();
            miembroGrupoRepository.save(nuevo);
            inv.setEstado("ACEPTADA");
        } else {
            inv.setEstado("RECHAZADA");
        }
        invitacionGrupoRepository.save(inv);
    }

    /**
     * Admin del grupo ve las solicitudes pendientes
     */
    public List<Map<String, Object>> solicitudesPendientes(UUID grupoId, UUID adminId) {
        verificarAdmin(grupoId, adminId);
        return invitacionGrupoRepository.findByGrupoIdAndEstado(grupoId, "PENDIENTE")
                .stream().map(inv -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", inv.getId());
                    map.put("solicitanteId", inv.getSolicitante().getId());
                    map.put("solicitanteNombre", inv.getSolicitante().getNombre());
                    map.put("solicitanteEmail", inv.getSolicitante().getEmail());
                    map.put("fechaSolicitud", inv.getFechaCreacion());
                    return map;
                }).collect(Collectors.toList());
    }

    // --- Balance ---
    public BalanceResponse calcularBalance(UUID grupoId) {
        Grupo grupo = grupoRepository.findById(grupoId)
                .orElseThrow(() -> new RuntimeException("Grupo no encontrado"));

        List<MiembroGrupo> miembros = miembroGrupoRepository.findByGrupoId(grupoId);
        List<Gasto> gastos = gastoRepository.findByGrupoId(grupoId, org.springframework.data.domain.Pageable.unpaged()).getContent();

        // Calcular cuánto pagó cada uno y cuánto le corresponde
        Map<UUID, BigDecimal> totalPagado = new HashMap<>();
        Map<UUID, BigDecimal> totalDebido = new HashMap<>();

        miembros.forEach(m -> {
            totalPagado.put(m.getUsuario().getId(), BigDecimal.ZERO);
            totalDebido.put(m.getUsuario().getId(), BigDecimal.ZERO);
        });

        BigDecimal totalGastos = BigDecimal.ZERO;
        for (Gasto g : gastos) {
            totalGastos = totalGastos.add(g.getMonto());
            if (g.getPagadoPor() != null) {
                totalPagado.merge(g.getPagadoPor().getId(), g.getMonto(), BigDecimal::add);
            }
            if (g.getDivisiones() != null) {
                for (var div : g.getDivisiones()) {
                    totalDebido.merge(div.getUsuario().getId(), div.getMontoAsignado(), BigDecimal::add);
                }
            }
        }

        List<BalanceResponse.BalanceUsuario> balances = miembros.stream().map(m -> {
            UUID uid = m.getUsuario().getId();
            BigDecimal pagado = totalPagado.getOrDefault(uid, BigDecimal.ZERO);
            BigDecimal debido = totalDebido.getOrDefault(uid, BigDecimal.ZERO);
            return BalanceResponse.BalanceUsuario.builder()
                    .usuarioId(uid)
                    .nombre(m.getUsuario().getNombre())
                    .totalPagado(pagado)
                    .totalDebido(debido)
                    .balance(pagado.subtract(debido)) // positivo = le deben
                    .build();
        }).collect(Collectors.toList());

        return BalanceResponse.builder()
                .grupoId(grupoId)
                .grupoNombre(grupo.getNombre())
                .totalGastos(totalGastos)
                .balances(balances)
                .build();
    }

    // --- Helpers ---
    private void verificarAdmin(UUID grupoId, UUID usuarioId) {
        MiembroGrupo m = miembroGrupoRepository.findByGrupoIdAndUsuarioId(grupoId, usuarioId)
                .orElseThrow(() -> new RuntimeException("No eres miembro de este grupo"));
        if (!"ADMIN".equals(m.getRol())) {
            throw new RuntimeException("Solo el administrador puede realizar esta acción");
        }
    }

    private GrupoResponse toResponse(Grupo g, String rol, int totalMiembros) {
        return GrupoResponse.builder()
                .id(g.getId())
                .nombre(g.getNombre())
                .descripcion(g.getDescripcion())
                .creadorNombre(g.getCreador() != null ? g.getCreador().getNombre() : "—")
                .rolActual(rol)
                .totalMiembros(totalMiembros)
                .fechaCreacion(g.getFechaCreacion())
                .build();
    }
}
