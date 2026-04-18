package com.rentshare.repository;

import com.rentshare.model.ExpenseParticipant;
import org.springframework.data.jpa.repository.JpaRepository;


public interface ExpenseParticipantRepository extends JpaRepository<ExpenseParticipant, ExpenseParticipant.ExpenseParticipantId> {
}
