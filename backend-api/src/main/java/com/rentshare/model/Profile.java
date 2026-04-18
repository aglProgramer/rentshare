package com.rentshare.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import java.time.ZonedDateTime;
import java.util.UUID;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "profiles")
@Getter
@Setter
@NoArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Profile {
    @Id
    private UUID id;

    @Column(nullable = false, length = 100)
    private String nombre;

    @Column(length = 20)
    private String celular;

    private String direccion;

    @Column(name = "avatar_url")
    private String avatarUrl;

    @Column(name = "invite_code", length = 50)
    private String inviteCode;

    @Column(name = "created_at")
    private ZonedDateTime createdAt;

    @Column(name = "updated_at")
    private ZonedDateTime updatedAt;
}
