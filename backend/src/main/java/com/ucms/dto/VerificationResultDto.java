package com.ucms.dto;

import java.util.Map;

public class VerificationResultDto {
    private boolean valid;
    private String referenceCode;
    private String documentType;
    private String title;
    private String citizenName;
    private String village;
    private String status;
    private String issueDate;
    private String approvedBy;
    private String digitalSignature;
    private String eSignStatus;
    private String issuingAuthority;
    private String message;
    private Map<String, Object> details;

    public VerificationResultDto() {
    }

    public static VerificationResultDto invalid(String refCode, String message) {
        VerificationResultDto dto = new VerificationResultDto();
        dto.setValid(false);
        dto.setReferenceCode(refCode);
        dto.setMessage(message);
        dto.setESignStatus("FAILED / NOT VERIFIED");
        return dto;
    }

    // Getters and Setters
    public boolean isValid() { return valid; }
    public void setValid(boolean valid) { this.valid = valid; }

    public String getReferenceCode() { return referenceCode; }
    public void setReferenceCode(String referenceCode) { this.referenceCode = referenceCode; }

    public String getDocumentType() { return documentType; }
    public void setDocumentType(String documentType) { this.documentType = documentType; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getCitizenName() { return citizenName; }
    public void setCitizenName(String citizenName) { this.citizenName = citizenName; }

    public String getVillage() { return village; }
    public void setVillage(String village) { this.village = village; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getIssueDate() { return issueDate; }
    public void setIssueDate(String issueDate) { this.issueDate = issueDate; }

    public String getApprovedBy() { return approvedBy; }
    public void setApprovedBy(String approvedByOfficer) { this.approvedBy = approvedByOfficer; }

    public String getDigitalSignature() { return digitalSignature; }
    public void setDigitalSignature(String digitalSignature) { this.digitalSignature = digitalSignature; }

    public String getESignStatus() { return eSignStatus; }
    public void setESignStatus(String eSignStatus) { this.eSignStatus = eSignStatus; }

    public String getIssuingAuthority() { return issuingAuthority; }
    public void setIssuingAuthority(String issuingAuthority) { this.issuingAuthority = issuingAuthority; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public Map<String, Object> getDetails() { return details; }
    public void setDetails(Map<String, Object> details) { this.details = details; }
}
