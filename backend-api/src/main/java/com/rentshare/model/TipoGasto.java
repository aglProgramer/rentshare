package com.rentshare.model;

/**
 * Tipo de gasto: puede ser individual (solo aplica a un usuario)
 * o unificado (se divide entre todos los miembros del grupo).
 */
public enum TipoGasto {
    INDIVIDUAL,   // Gasto personal, no se divide
    UNIFICADO     // Gasto grupal, se divide entre los integrantes
}
