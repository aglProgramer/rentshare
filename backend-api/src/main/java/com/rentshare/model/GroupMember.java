package com.rentshare.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.EqualsAndHashCode;
import java.io.Serializable;
import java.time.ZonedDateTime;
import java.util.UUID;

import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "group_members")
@Getter
@Setter
@NoArgsConstructor
@IdClass(GroupMember.GroupMemberId.class)
public class GroupMember {

    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "group_id")
    @JsonIgnore
    private Group group;

    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "profile_id")
    private Profile profile;

    @Column(name = "joined_at")
    private ZonedDateTime joinedAt;

    @Getter
    @Setter
    @NoArgsConstructor
    @EqualsAndHashCode
    public static class GroupMemberId implements Serializable {
        private UUID group;
        private UUID profile;
    }
}
