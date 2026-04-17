package com.rentshare.application.events;

import java.util.List;

public interface EventStore {
    void appendEvent(DomainEvent event);
    List<DomainEvent> getEventsForAggregate(String aggregateId);
    List<DomainEvent> getAllEvents();
}
