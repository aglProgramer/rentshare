package com.rentshare.api.controller.v1;

import com.rentshare.api.dto.request.CrearGastoRequest;
import com.rentshare.api.dto.response.GastoResponse;
import com.rentshare.api.repository.UsuarioRepository;
import com.rentshare.api.service.GastoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/gastos")
@RequiredArgsConstructor
public class GastoController {

    private final GastoService gastoService;
    private final UsuarioRepository usuarioRepository;

    @GetMapping
    public ResponseEntity<Page<GastoResponse>> listar(
            @RequestParam UUID grupoId,
            @RequestParam(required = false) String categoria,
            @PageableDefault(size = 20, sort = "fechaGasto") Pageable pageable) {
        return ResponseEntity.ok(gastoService.listar(grupoId, categoria, pageable));
    }

    @PostMapping
    public ResponseEntity<GastoResponse> crear(
            @Valid @RequestBody CrearGastoRequest req,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(gastoService.crear(req, getUsrId(userDetails)));
    }

    @DeleteMapping("/{gastoId}")
    public ResponseEntity<Void> eliminar(
            @PathVariable UUID gastoId,
            @AuthenticationPrincipal UserDetails userDetails) {
        gastoService.eliminar(gastoId, getUsrId(userDetails));
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{gastoId}/pagar")
    public ResponseEntity<GastoResponse> marcarPagado(
            @PathVariable UUID gastoId,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(gastoService.marcarDivisionPagada(gastoId, getUsrId(userDetails)));
    }

    private UUID getUsrId(UserDetails ud) {
        return usuarioRepository.findByEmail(ud.getUsername())
                .orElseThrow().getId();
    }
}
