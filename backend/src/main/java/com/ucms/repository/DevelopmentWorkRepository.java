package com.ucms.repository;

import com.ucms.model.DevelopmentWork;
import com.ucms.model.WorkStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DevelopmentWorkRepository extends JpaRepository<DevelopmentWork, Long> {
    Optional<DevelopmentWork> findByWorkId(String workId);
    List<DevelopmentWork> findAllByOrderByCreatedAtDesc();
    long countByStatus(WorkStatus status);
}
