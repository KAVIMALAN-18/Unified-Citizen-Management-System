package com.ucms.dto;

import com.ucms.model.Grievance;
import com.ucms.model.GrievanceStatus;

import java.time.LocalDateTime;

public class GrievanceDto {
    private Long id;
    private String grievanceId;
    private Long citizenId;
    private String citizenName;
    private Long applicationId;
    private String category;
    private String subject;
    private String description;
    private GrievanceStatus status;
    private String officerResponse;
    private LocalDateTime createdAt;

    public GrievanceDto() {
    }

    public static GrievanceDto fromEntity(Grievance g) {
        GrievanceDto dto = new GrievanceDto();
        dto.setId(g.getId());
        dto.setGrievanceId(g.getGrievanceId());
        if (g.getCitizen() != null) {
            dto.setCitizenId(g.getCitizen().getId());
            dto.setCitizenName(g.getCitizen().getFullName());
        }
        if (g.getApplication() != null) {
            dto.setApplicationId(g.getApplication().getId());
        }
        dto.setCategory(g.getCategory());
        dto.setSubject(g.getSubject());
        dto.setDescription(g.getDescription());
        dto.setStatus(g.getStatus());
        dto.setOfficerResponse(g.getOfficerResponse());
        dto.setCreatedAt(g.getCreatedAt());
        return dto;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getGrievanceId() { return grievanceId; }
    public void setGrievanceId(String grievanceId) { this.grievanceId = grievanceId; }

    public Long getCitizenId() { return citizenId; }
    public void setCitizenId(Long citizenId) { this.citizenId = citizenId; }

    public String getCitizenName() { return citizenName; }
    public void setCitizenName(String citizenName) { this.citizenName = citizenName; }

    public Long getApplicationId() { return applicationId; }
    public void setApplicationId(Long applicationId) { this.applicationId = applicationId; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public GrievanceStatus getStatus() { return status; }
    public void setStatus(GrievanceStatus status) { this.status = status; }

    public String getOfficerResponse() { return officerResponse; }
    public void setOfficerResponse(String officerResponse) { this.officerResponse = officerResponse; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
