package com.rentshare.api.controller.v1;

import com.rentshare.api.dto.response.StatsResponse;
import com.rentshare.api.service.GastoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/reportes")
@RequiredArgsConstructor
public class ReporteController {

    private final GastoService gastoService;

    @GetMapping("/stats")
    public ResponseEntity<StatsResponse> getStats(@RequestParam UUID grupoId) {
        return ResponseEntity.ok(gastoService.obtenerStats(grupoId));
    }
}
