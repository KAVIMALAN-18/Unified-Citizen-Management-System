package com.ucms.repository;

import com.ucms.model.Grievance;
import com.ucms.model.GrievanceStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GrievanceRepository extends JpaRepository<Grievance, Long> {
    Optional<Grievance> findByGrievanceId(String grievanceId);
    List<Grievance> findByCitizenIdOrderByCreatedAtDesc(Long citizenId);
    List<Grievance> findAllByOrderByCreatedAtDesc();
    long countByStatus(GrievanceStatus status);
}
