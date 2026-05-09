package com.rentshare.api.controller.v1;

import com.rentshare.api.dto.request.TareaRequest;
import com.rentshare.api.dto.response.TareaResponse;
import com.rentshare.api.repository.UsuarioRepository;
import com.rentshare.api.service.TareaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/tareas")
@RequiredArgsConstructor
public class TareaController {

    private final TareaService tareaService;
    private final UsuarioRepository usuarioRepository;

    @GetMapping
    public ResponseEntity<List<TareaResponse>> listar(@RequestParam UUID grupoId) {
        return ResponseEntity.ok(tareaService.listarPorGrupo(grupoId));
    }

    @PostMapping
    public ResponseEntity<TareaResponse> crear(
            @RequestBody TareaRequest req,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(tareaService.crear(req, getUsrId(userDetails)));
    }

    @PatchMapping("/{tareaId}/estado")
    public ResponseEntity<TareaResponse> cambiarEstado(
            @PathVariable UUID tareaId,
            @RequestParam String estado,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(tareaService.cambiarEstado(tareaId, estado, getUsrId(userDetails)));
    }

    @DeleteMapping("/{tareaId}")
    public ResponseEntity<Void> eliminar(
            @PathVariable UUID tareaId,
            @AuthenticationPrincipal UserDetails userDetails) {
        tareaService.eliminar(tareaId, getUsrId(userDetails));
        return ResponseEntity.noContent().build();
    }

    private UUID getUsrId(UserDetails ud) {
        return usuarioRepository.findByEmail(ud.getUsername())
                .orElseThrow().getId();
    }
}
