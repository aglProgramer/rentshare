package com.rentshare.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.EqualsAndHashCode;
import java.io.Serializable;
import java.math.BigDecimal;
import java.util.UUID;

import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "expense_participants")
@Getter
@Setter
@NoArgsConstructor
@IdClass(ExpenseParticipant.ExpenseParticipantId.class)
public class ExpenseParticipant {

    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "expense_id")
    @JsonIgnore
    private Expense expense;

    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "profile_id")
    private Profile profile;

    @Column(name = "amount_owed", nullable = false, precision = 15, scale = 2)
    private BigDecimal amountOwed;

    @Getter
    @Setter
    @NoArgsConstructor
    @EqualsAndHashCode
    public static class ExpenseParticipantId implements Serializable {
        private UUID expense;
        private UUID profile;
    }
}
