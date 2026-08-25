package com.ucms.dto;

import com.ucms.model.Application;
import com.ucms.model.ApplicationStatus;
import com.ucms.model.AiAnalysisStatus;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class ApplicationDto {
    private Long id;
    private String applicationId;
    private Long citizenId;
    private String citizenName;
    private String schemeId;
    private String schemeName;
    private LocalDate applicationDate;
    private BigDecimal declaredIncome;
    private BigDecimal declaredLandArea;
    private Integer documentCount;
    private ApplicationStatus status;
    private String officerRemarks;
    private AiAnalysisStatus aiAnalysisStatus;
    private LocalDateTime createdAt;

    public ApplicationDto() {
    }

    public static ApplicationDto fromEntity(Application app) {
        ApplicationDto dto = new ApplicationDto();
        dto.setId(app.getId());
        dto.setApplicationId(app.getApplicationId());
        if (app.getCitizen() != null) {
            dto.setCitizenId(app.getCitizen().getId());
            dto.setCitizenName(app.getCitizen().getFullName());
        }
        if (app.getScheme() != null) {
            dto.setSchemeId(app.getScheme().getSchemeId());
            dto.setSchemeName(app.getScheme().getName());
        }
        dto.setApplicationDate(app.getApplicationDate());
        dto.setDeclaredIncome(app.getDeclaredIncome());
        dto.setDeclaredLandArea(app.getDeclaredLandArea());
        dto.setDocumentCount(app.getDocumentCount());
        dto.setStatus(app.getStatus());
        dto.setOfficerRemarks(app.getOfficerRemarks());
        dto.setAiAnalysisStatus(app.getAiAnalysisStatus());
        dto.setCreatedAt(app.getCreatedAt());
        return dto;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getApplicationId() { return applicationId; }
    public void setApplicationId(String applicationId) { this.applicationId = applicationId; }

    public Long getCitizenId() { return citizenId; }
    public void setCitizenId(Long citizenId) { this.citizenId = citizenId; }

    public String getCitizenName() { return citizenName; }
    public void setCitizenName(String citizenName) { this.citizenName = citizenName; }

    public String getSchemeId() { return schemeId; }
    public void setSchemeId(String schemeId) { this.schemeId = schemeId; }

    public String getSchemeName() { return schemeName; }
    public void setSchemeName(String schemeName) { this.schemeName = schemeName; }

    public LocalDate getApplicationDate() { return applicationDate; }
    public void setApplicationDate(LocalDate applicationDate) { this.applicationDate = applicationDate; }

    public BigDecimal getDeclaredIncome() { return declaredIncome; }
    public void setDeclaredIncome(BigDecimal declaredIncome) { this.declaredIncome = declaredIncome; }

    public BigDecimal getDeclaredLandArea() { return declaredLandArea; }
    public void setDeclaredLandArea(BigDecimal declaredLandArea) { this.declaredLandArea = declaredLandArea; }

    public Integer getDocumentCount() { return documentCount; }
    public void setDocumentCount(Integer documentCount) { this.documentCount = documentCount; }

    public ApplicationStatus getStatus() { return status; }
    public void setStatus(ApplicationStatus status) { this.status = status; }

    public String getOfficerRemarks() { return officerRemarks; }
    public void setOfficerRemarks(String officerRemarks) { this.officerRemarks = officerRemarks; }

    public AiAnalysisStatus getAiAnalysisStatus() { return aiAnalysisStatus; }
    public void setAiAnalysisStatus(AiAnalysisStatus aiAnalysisStatus) { this.aiAnalysisStatus = aiAnalysisStatus; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
