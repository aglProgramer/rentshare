package com.rentshare.api.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CrearGrupoRequest {
    @NotBlank
    @Size(min = 3, max = 150)
    private String nombre;
    private String descripcion;
}
