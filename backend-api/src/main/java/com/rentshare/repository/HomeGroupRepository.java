package com.rentshare.repository;

import com.rentshare.model.HomeGroup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface HomeGroupRepository extends JpaRepository<HomeGroup, Long> {
    Optional<HomeGroup> findByCodigoInvitacion(String codigoInvitacion);
}
