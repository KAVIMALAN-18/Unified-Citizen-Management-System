package com.ucms.service;

import com.ucms.dto.CertificateCreateRequest;
import com.ucms.dto.CertificateRequestDto;
import com.ucms.model.CertificateRequest;
import com.ucms.model.CertificateStatus;
import com.ucms.model.Citizen;
import com.ucms.repository.CertificateRequestRepository;
import com.ucms.repository.CitizenRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@SuppressWarnings("null")
@Service
public class CertificateService {

    private final CertificateRequestRepository certificateRequestRepository;
    private final CitizenRepository citizenRepository;

    public CertificateService(CertificateRequestRepository certificateRequestRepository,
                              CitizenRepository citizenRepository) {
        this.certificateRequestRepository = certificateRequestRepository;
        this.citizenRepository = citizenRepository;
    }

    @Transactional
    public CertificateRequestDto createRequest(String citizenEmail, CertificateCreateRequest request) {
        Citizen citizen = citizenRepository.findByEmail(citizenEmail.trim().toLowerCase())
                .orElseThrow(() -> new IllegalArgumentException("Citizen profile not found"));

        CertificateRequest cr = new CertificateRequest();
        cr.setRequestId("REQ" + System.currentTimeMillis() % 1000000);
        cr.setCitizen(citizen);
        cr.setCertificateType(request.getCertificateType());
        cr.setSubmittedInfo(request.getSubmittedInfo());
        cr.setStatus(CertificateStatus.SUBMITTED);

        CertificateRequest saved = certificateRequestRepository.save(cr);
        return CertificateRequestDto.fromEntity(saved);
    }

    @Transactional(readOnly = true)
    public List<CertificateRequestDto> getCitizenRequests(String citizenEmail) {
        Citizen citizen = citizenRepository.findByEmail(citizenEmail.trim().toLowerCase())
                .orElseThrow(() -> new IllegalArgumentException("Citizen profile not found"));

        return certificateRequestRepository.findByCitizenIdOrderByCreatedAtDesc(citizen.getId())
                .stream()
                .map(CertificateRequestDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public String downloadCertificate(Long id, String citizenEmail) {
        Citizen citizen = citizenRepository.findByEmail(citizenEmail.trim().toLowerCase())
                .orElseThrow(() -> new IllegalArgumentException("Citizen profile not found"));

        CertificateRequest cr = certificateRequestRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Certificate request not found"));

        if (!cr.getCitizen().getId().equals(citizen.getId())) {
            throw new IllegalArgumentException("Unauthorized access to certificate");
        }

        if (cr.getStatus() != CertificateStatus.APPROVED) {
            throw new IllegalStateException("Certificate is not approved yet. Current status: " + cr.getStatus());
        }

        return "UCMS OFFICIAL CERTIFICATE\n" +
                "Reference: " + cr.getCertificateReference() + "\n" +
                "Type: " + cr.getCertificateType() + "\n" +
                "Issued To: " + citizen.getFullName() + "\n" +
                "Village: " + citizen.getVillage() + "\n" +
                "Date: " + cr.getUpdatedAt();
    }
}
