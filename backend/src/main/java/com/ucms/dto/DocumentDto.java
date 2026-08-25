package com.ucms.dto;

import com.ucms.model.DocumentEntity;

import java.time.LocalDateTime;

public class DocumentDto {
    private Long id;
    private Long applicationId;
    private Long citizenId;
    private String documentType;
    private String fileName;
    private String filePath;
    private String uploadStatus;
    private String verificationStatus;
    private LocalDateTime uploadedAt;

    public DocumentDto() {
    }

    public static DocumentDto fromEntity(DocumentEntity doc) {
        DocumentDto dto = new DocumentDto();
        dto.setId(doc.getId());
        if (doc.getApplication() != null) {
            dto.setApplicationId(doc.getApplication().getId());
        }
        if (doc.getCitizen() != null) {
            dto.setCitizenId(doc.getCitizen().getId());
        }
        dto.setDocumentType(doc.getDocumentType());
        dto.setFileName(doc.getFileName());
        dto.setFilePath(doc.getFilePath());
        dto.setUploadStatus(doc.getUploadStatus());
        dto.setVerificationStatus(doc.getVerificationStatus());
        dto.setUploadedAt(doc.getUploadedAt());
        return dto;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getApplicationId() { return applicationId; }
    public void setApplicationId(Long applicationId) { this.applicationId = applicationId; }

    public Long getCitizenId() { return citizenId; }
    public void setCitizenId(Long citizenId) { this.citizenId = citizenId; }

    public String getDocumentType() { return documentType; }
    public void setDocumentType(String documentType) { this.documentType = documentType; }

    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }

    public String getFilePath() { return filePath; }
    public void setFilePath(String filePath) { this.filePath = filePath; }

    public String getUploadStatus() { return uploadStatus; }
    public void setUploadStatus(String uploadStatus) { this.uploadStatus = uploadStatus; }

    public String getVerificationStatus() { return verificationStatus; }
    public void setVerificationStatus(String verificationStatus) { this.verificationStatus = verificationStatus; }

    public LocalDateTime getUploadedAt() { return uploadedAt; }
    public void setUploadedAt(LocalDateTime uploadedAt) { this.uploadedAt = uploadedAt; }
}
