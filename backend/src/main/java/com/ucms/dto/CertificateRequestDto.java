package com.ucms.dto;

import com.ucms.model.CertificateRequest;
import com.ucms.model.CertificateStatus;
import com.ucms.model.CertificateType;

import java.time.LocalDateTime;

public class CertificateRequestDto {
    private Long id;
    private String requestId;
    private Long citizenId;
    private String citizenName;
    private CertificateType certificateType;
    private String submittedInfo;
    private CertificateStatus status;
    private String officerRemarks;
    private String certificateReference;
    private LocalDateTime createdAt;

    public CertificateRequestDto() {
    }

    public static CertificateRequestDto fromEntity(CertificateRequest cr) {
        CertificateRequestDto dto = new CertificateRequestDto();
        dto.setId(cr.getId());
        dto.setRequestId(cr.getRequestId());
        if (cr.getCitizen() != null) {
            dto.setCitizenId(cr.getCitizen().getId());
            dto.setCitizenName(cr.getCitizen().getFullName());
        }
        dto.setCertificateType(cr.getCertificateType());
        dto.setSubmittedInfo(cr.getSubmittedInfo());
        dto.setStatus(cr.getStatus());
        dto.setOfficerRemarks(cr.getOfficerRemarks());
        dto.setCertificateReference(cr.getCertificateReference());
        dto.setCreatedAt(cr.getCreatedAt());
        return dto;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getRequestId() { return requestId; }
    public void setRequestId(String requestId) { this.requestId = requestId; }

    public Long getCitizenId() { return citizenId; }
    public void setCitizenId(Long citizenId) { this.citizenId = citizenId; }

    public String getCitizenName() { return citizenName; }
    public void setCitizenName(String citizenName) { this.citizenName = citizenName; }

    public CertificateType getCertificateType() { return certificateType; }
    public void setCertificateType(CertificateType certificateType) { this.certificateType = certificateType; }

    public String getSubmittedInfo() { return submittedInfo; }
    public void setSubmittedInfo(String submittedInfo) { this.submittedInfo = submittedInfo; }

    public CertificateStatus getStatus() { return status; }
    public void setStatus(CertificateStatus status) { this.status = status; }

    public String getOfficerRemarks() { return officerRemarks; }
    public void setOfficerRemarks(String officerRemarks) { this.officerRemarks = officerRemarks; }

    public String getCertificateReference() { return certificateReference; }
    public void setCertificateReference(String certificateReference) { this.certificateReference = certificateReference; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
