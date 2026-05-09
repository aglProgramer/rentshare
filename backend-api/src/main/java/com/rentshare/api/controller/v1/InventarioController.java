package com.rentshare.api.controller.v1;

import com.rentshare.api.dto.request.InventarioRequest;
import com.rentshare.api.dto.response.InventarioResponse;
import com.rentshare.api.repository.UsuarioRepository;
import com.rentshare.api.service.InventarioService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/inventario")
@RequiredArgsConstructor
public class InventarioController {

    private final InventarioService inventarioService;
    private final UsuarioRepository usuarioRepository;

    @GetMapping
    public ResponseEntity<List<InventarioResponse>> listar(@RequestParam UUID grupoId) {
        return ResponseEntity.ok(inventarioService.listarPorGrupo(grupoId));
    }

    @PostMapping
    public ResponseEntity<InventarioResponse> guardar(
            @RequestBody InventarioRequest req,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(inventarioService.guardar(req, getUsrId(userDetails)));
    }

    @PatchMapping("/{itemId}/cantidad")
    public ResponseEntity<InventarioResponse> actualizarCantidad(
            @PathVariable UUID itemId,
            @RequestParam BigDecimal cantidad,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(inventarioService.actualizarCantidad(itemId, cantidad, getUsrId(userDetails)));
    }

    @DeleteMapping("/{itemId}")
    public ResponseEntity<Void> eliminar(
            @PathVariable UUID itemId,
            @AuthenticationPrincipal UserDetails userDetails) {
        inventarioService.eliminar(itemId, getUsrId(userDetails));
        return ResponseEntity.noContent().build();
    }

    private UUID getUsrId(UserDetails ud) {
        return usuarioRepository.findByEmail(ud.getUsername())
                .orElseThrow().getId();
    }
}
