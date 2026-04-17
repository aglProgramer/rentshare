package com.rentshare.controller;

import com.rentshare.application.events.DomainEvent;
import com.rentshare.application.events.EventStore;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/events")
@RequiredArgsConstructor
@Tag(name = "Event Sourcing", description = "Endpoints para la auditoría y reconstrucción de estado (CQRS + Event Sourcing)")
public class EventController {

    private final EventStore eventStore;

    @GetMapping
    @Operation(summary = "Obtener historial de eventos", description = "Retorna la lista inmutable de todos los eventos de dominio ocurridos en el sistema.")
    public List<DomainEvent> getAllEvents() {
        return eventStore.getAllEvents();
    }

    @GetMapping("/{aggregateId}")
    @Operation(summary = "Eventos por Entidad", description = "Retorna la reconstrucción de eventos para un ID de Agregado particular.")
    public List<DomainEvent> getEventsForAggregate(@PathVariable String aggregateId) {
        return eventStore.getEventsForAggregate(aggregateId);
    }
}
