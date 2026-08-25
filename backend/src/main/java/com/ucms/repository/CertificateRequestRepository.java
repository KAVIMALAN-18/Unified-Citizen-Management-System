package com.ucms.repository;

import com.ucms.model.CertificateRequest;
import com.ucms.model.CertificateStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CertificateRequestRepository extends JpaRepository<CertificateRequest, Long> {
    Optional<CertificateRequest> findByRequestId(String requestId);
    List<CertificateRequest> findByCitizenIdOrderByCreatedAtDesc(Long citizenId);
    List<CertificateRequest> findAllByOrderByCreatedAtDesc();
    long countByStatus(CertificateStatus status);
}
