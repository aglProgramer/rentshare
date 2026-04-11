package com.rentshare.exception;

import com.rentshare.dto.ApiErrorDTO;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * Manejador global de excepciones para toda la API.
 * Captura errores y los convierte en respuestas JSON limpias y consistentes.
 *
 * Errores manejados:
 *   - ResourceNotFoundException → 404 Not Found
 *   - BadRequestException       → 400 Bad Request
 *   - MethodArgumentNotValidException → 400 (errores de validación DTO)
 *   - Exception (genérico)      → 500 Internal Server Error
 */
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    // =========================================================
    // 404 - Recurso no encontrado
    // =========================================================
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiErrorDTO> handleResourceNotFound(
            ResourceNotFoundException ex, HttpServletRequest request) {

        ApiErrorDTO error = ApiErrorDTO.builder()
                .status(HttpStatus.NOT_FOUND.value())
                .error("Recurso no encontrado")
                .mensaje(ex.getMessage())
                .timestamp(LocalDateTime.now())
                .path(request.getRequestURI())
                .build();

        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }

    // =========================================================
    // 400 - Solicitud inválida (regla de negocio)
    // =========================================================
    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<ApiErrorDTO> handleBadRequest(
            BadRequestException ex, HttpServletRequest request) {

        ApiErrorDTO error = ApiErrorDTO.builder()
                .status(HttpStatus.BAD_REQUEST.value())
                .error("Datos inválidos")
                .mensaje(ex.getMessage())
                .timestamp(LocalDateTime.now())
                .path(request.getRequestURI())
                .build();

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    // =========================================================
    // 400 - Errores de validación de Bean Validation (@Valid)
    // =========================================================
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiErrorDTO> handleValidationErrors(
            MethodArgumentNotValidException ex, HttpServletRequest request) {

        // Extrae los errores de validación de cada campo en un Map
        Map<String, String> fieldErrors = new java.util.HashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(error -> 
            fieldErrors.put(error.getField(), error.getDefaultMessage())
        );

        ApiErrorDTO error = ApiErrorDTO.builder()
                .status(HttpStatus.BAD_REQUEST.value())
                .error("Error de validación")
                .mensaje("La petición contiene errores en sus campos")
                .fieldErrors(fieldErrors)
                .timestamp(LocalDateTime.now())
                .path(request.getRequestURI())
                .build();

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    // =========================================================
    // 500 - Error interno no controlado
    // =========================================================
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiErrorDTO> handleGenericException(
            Exception ex, HttpServletRequest request) {

        // Loggear el stacktrace en la consola para los desarrolladores
        log.error("Excepción no controlada lanzada en: {}", request.getRequestURI(), ex);

        ApiErrorDTO error = ApiErrorDTO.builder()
                .status(HttpStatus.INTERNAL_SERVER_ERROR.value())
                .error("Error interno del servidor")
                .mensaje("Ocurrió un error inesperado. Por favor contacte al administrador.")
                .timestamp(LocalDateTime.now())
                .path(request.getRequestURI())
                .build();

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
    }
}
