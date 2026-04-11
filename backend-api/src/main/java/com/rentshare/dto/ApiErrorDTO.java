package com.rentshare.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * DTO estándar para respuestas de error de la API.
 * Todos los errores del sistema devuelven este formato JSON
 * para facilitar el manejo en el frontend.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApiErrorDTO {

    /** Código HTTP del error (404, 400, 500, etc.) */
    private int status;

    /** Tipo de error legible (ej: "Recurso no encontrado") */
    private String error;

    /** Mensaje detallado del error principal */
    private String mensaje;

    /** Errores específicos por campo (ej: {"monto": "Debe ser mayor a 0"}) */
    private Map<String, String> fieldErrors;

    /** Timestamp ISO de cuando ocurrió el error */
    private LocalDateTime timestamp;

    /** Ruta del endpoint que causó el error */
    private String path;
}
