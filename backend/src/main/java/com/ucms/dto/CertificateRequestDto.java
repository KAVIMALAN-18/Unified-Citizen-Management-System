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
    private String digitalSignature;
    private LocalDateTime issuedAt;
    private String approvedByOfficer;
    private String village;
    private java.math.BigDecimal annualIncome;
    private java.time.LocalDate dateOfBirth;
    private String gender;
    private String address;
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
            dto.setVillage(cr.getCitizen().getVillage());
            dto.setAnnualIncome(cr.getCitizen().getAnnualIncome());
            dto.setDateOfBirth(cr.getCitizen().getDateOfBirth());
            dto.setGender(cr.getCitizen().getGender() != null ? cr.getCitizen().getGender().name() : "N/A");
            dto.setAddress(cr.getCitizen().getAddress());
        }
        dto.setCertificateType(cr.getCertificateType());
        dto.setSubmittedInfo(cr.getSubmittedInfo());
        dto.setStatus(cr.getStatus());
        dto.setOfficerRemarks(cr.getOfficerRemarks());
        dto.setCertificateReference(cr.getCertificateReference());
        dto.setDigitalSignature(cr.getDigitalSignature());
        dto.setIssuedAt(cr.getIssuedAt());
        dto.setApprovedByOfficer(cr.getApprovedByOfficer());
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

    public String getDigitalSignature() { return digitalSignature; }
    public void setDigitalSignature(String digitalSignature) { this.digitalSignature = digitalSignature; }

    public LocalDateTime getIssuedAt() { return issuedAt; }
    public void setIssuedAt(LocalDateTime issuedAt) { this.issuedAt = issuedAt; }

    public String getApprovedByOfficer() { return approvedByOfficer; }
    public void setApprovedByOfficer(String approvedByOfficer) { this.approvedByOfficer = approvedByOfficer; }

    public String getVillage() { return village; }
    public void setVillage(String village) { this.village = village; }

    public java.math.BigDecimal getAnnualIncome() { return annualIncome; }
    public void setAnnualIncome(java.math.BigDecimal annualIncome) { this.annualIncome = annualIncome; }

    public java.time.LocalDate getDateOfBirth() { return dateOfBirth; }
    public void setDateOfBirth(java.time.LocalDate dateOfBirth) { this.dateOfBirth = dateOfBirth; }

    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
