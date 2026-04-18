package com.rentshare.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import java.time.ZonedDateTime;
import java.util.UUID;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "categories")
@Getter
@Setter
@NoArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Category {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 50, unique = true)
    private String name;

    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private Profile createdBy;

    @Column(name = "created_at")
    private ZonedDateTime createdAt;
}
