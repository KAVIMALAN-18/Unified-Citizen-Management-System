package com.ucms.repository;

import com.ucms.model.Application;
import com.ucms.model.ApplicationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ApplicationRepository extends JpaRepository<Application, Long> {
    Optional<Application> findByApplicationId(String applicationId);
    List<Application> findByCitizenIdOrderByCreatedAtDesc(Long citizenId);
    List<Application> findAllByOrderByCreatedAtDesc();
    long countByStatus(ApplicationStatus status);
}
