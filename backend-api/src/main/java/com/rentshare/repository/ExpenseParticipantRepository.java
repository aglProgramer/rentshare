package com.rentshare.repository;

import com.rentshare.model.ExpenseParticipant;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface ExpenseParticipantRepository extends JpaRepository<ExpenseParticipant, ExpenseParticipant.ExpenseParticipantId> {
}
