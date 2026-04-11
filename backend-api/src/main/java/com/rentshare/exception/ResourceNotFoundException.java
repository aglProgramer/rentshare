package com.rentshare.exception;

/**
 * Excepción lanzada cuando no se encuentra un recurso solicitado.
 * Resulta en una respuesta HTTP 404 Not Found.
 *
 * Ejemplo de uso:
 *   throw new ResourceNotFoundException("Gasto", "id", 42L);
 *   // → "Gasto con id: 42 no fue encontrado"
 */
public class ResourceNotFoundException extends RuntimeException {

    private final String resourceName;
    private final String fieldName;
    private final Object fieldValue;

    public ResourceNotFoundException(String resourceName, String fieldName, Object fieldValue) {
        super(String.format("%s con %s: %s no fue encontrado", resourceName, fieldName, fieldValue));
        this.resourceName = resourceName;
        this.fieldName = fieldName;
        this.fieldValue = fieldValue;
    }

    public String getResourceName() { return resourceName; }
    public String getFieldName()    { return fieldName; }
    public Object getFieldValue()   { return fieldValue; }
}
