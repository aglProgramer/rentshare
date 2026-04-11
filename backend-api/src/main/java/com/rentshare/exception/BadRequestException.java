package com.rentshare.exception;

/**
 * Excepción lanzada cuando los datos de entrada de una operación son inválidos.
 * Resulta en una respuesta HTTP 400 Bad Request.
 */
public class BadRequestException extends RuntimeException {

    public BadRequestException(String message) {
        super(message);
    }
}
