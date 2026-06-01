package com.rentshare.api.controller.v1;

import com.rentshare.api.dto.request.CrearGrupoRequest;
import com.rentshare.api.dto.response.BalanceResponse;
import com.rentshare.api.dto.response.GrupoResponse;
import com.rentshare.api.dto.response.UsuarioResponse;
import com.rentshare.api.service.GrupoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import com.rentshare.api.repository.UsuarioRepository;

@RestController
@RequestMapping("/api/v1/grupos")
@RequiredArgsConstructor
public class GrupoController {

    private final GrupoService grupoService;
    private final UsuarioRepository usuarioRepository;

    @PostMapping
    public ResponseEntity<GrupoResponse> crear(
            @Valid @RequestBody CrearGrupoRequest req,
            @AuthenticationPrincipal UserDetails userDetails) {
        UUID userId = getUsrId(userDetails);
        return ResponseEntity.ok(grupoService.crear(req, userId));
    }

    @GetMapping("/mis")
    public ResponseEntity<List<GrupoResponse>> misGrupos(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(grupoService.misGrupos(getUsrId(userDetails)));
    }

    @GetMapping("/{grupoId}/miembros")
    public ResponseEntity<List<UsuarioResponse>> miembros(@PathVariable UUID grupoId) {
        return ResponseEntity.ok(grupoService.miembros(grupoId));
    }

    @PostMapping("/{grupoId}/invitacion")
    public ResponseEntity<Map<String, String>> generarInvitacion(
            @PathVariable UUID grupoId,
            @AuthenticationPrincipal UserDetails userDetails) {
        String codigo = grupoService.generarCodigoInvitacion(grupoId, getUsrId(userDetails));
        return ResponseEntity.ok(Map.of("codigo", codigo));
    }

    @PostMapping("/unirse")
    public ResponseEntity<Void> solicitarUnion(
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal UserDetails userDetails) {
        grupoService.solicitarUnion(body.get("codigo"), getUsrId(userDetails));
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{grupoId}/solicitudes")
    public ResponseEntity<List<Map<String, Object>>> solicitudesPendientes(
            @PathVariable UUID grupoId,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(grupoService.solicitudesPendientes(grupoId, getUsrId(userDetails)));
    }

    @PostMapping("/solicitudes/{invitacionId}/responder")
    public ResponseEntity<Void> responder(
            @PathVariable UUID invitacionId,
            @RequestBody Map<String, Boolean> body,
            @AuthenticationPrincipal UserDetails userDetails) {
        grupoService.responderSolicitud(invitacionId, body.get("aceptar"), getUsrId(userDetails));
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{grupoId}/balance")
    public ResponseEntity<BalanceResponse> balance(@PathVariable UUID grupoId) {
        return ResponseEntity.ok(grupoService.calcularBalance(grupoId));
    }

    @PostMapping("/{grupoId}/salir")
    public ResponseEntity<Void> salir(@PathVariable UUID grupoId,
            @AuthenticationPrincipal UserDetails userDetails) {
        grupoService.salirDeGrupo(grupoId, getUsrId(userDetails));
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{grupoId}")
    public ResponseEntity<Void> eliminar(@PathVariable UUID grupoId,
            @AuthenticationPrincipal UserDetails userDetails) {
        grupoService.eliminarGrupo(grupoId, getUsrId(userDetails));
        return ResponseEntity.ok().build();
    }

    private UUID getUsrId(UserDetails ud) {
        return usuarioRepository.findByEmail(ud.getUsername())
                .orElseThrow().getId();
    }
}
