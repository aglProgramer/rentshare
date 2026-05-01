package com.rentshare.api.controller.v1;

import com.rentshare.api.dto.response.UsuarioResponse;
import com.rentshare.api.service.UsuarioService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/usuarios")
@RequiredArgsConstructor
public class UsuarioController {

    private final UsuarioService usuarioService;

    @GetMapping
    public ResponseEntity<Page<UsuarioResponse>> getUsuarios(
            @PageableDefault(size = 10) Pageable pageable
    ) {
        return ResponseEntity.ok(usuarioService.listarTodos(pageable));
    }
}
