package com.ucms.repository;

import com.ucms.model.DocumentEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DocumentRepository extends JpaRepository<DocumentEntity, Long> {
    List<DocumentEntity> findByApplicationId(Long applicationId);
    List<DocumentEntity> findByCitizenId(Long citizenId);
}
