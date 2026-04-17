package com.rentshare.infrastructure.events;

import com.rentshare.application.events.DomainEvent;
import com.rentshare.application.events.EventStore;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Repository
public class InMemoryEventStore implements EventStore {

    private final List<DomainEvent> events = new ArrayList<>();

    @Override
    public synchronized void appendEvent(DomainEvent event) {
        events.add(event);
    }

    @Override
    public List<DomainEvent> getEventsForAggregate(String aggregateId) {
        return events.stream()
                .filter(e -> aggregateId.equals(e.getAggregateId()))
                .collect(Collectors.toList());
    }

    @Override
    public List<DomainEvent> getAllEvents() {
        return new ArrayList<>(events);
    }
}
