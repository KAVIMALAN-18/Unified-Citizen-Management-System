package com.ucms.dto;

import com.ucms.model.Suggestion;
import com.ucms.model.SuggestionStatus;

import java.time.LocalDateTime;

public class SuggestionDto {
    private Long id;
    private String suggestionId;
    private Long citizenId;
    private String citizenName;
    private String title;
    private String description;
    private String category;
    private SuggestionStatus status;
    private String officerRemarks;
    private LocalDateTime createdAt;

    public SuggestionDto() {
    }

    public static SuggestionDto fromEntity(Suggestion s) {
        SuggestionDto dto = new SuggestionDto();
        dto.setId(s.getId());
        dto.setSuggestionId(s.getSuggestionId());
        if (s.getCitizen() != null) {
            dto.setCitizenId(s.getCitizen().getId());
            dto.setCitizenName(s.getCitizen().getFullName());
        }
        dto.setTitle(s.getTitle());
        dto.setDescription(s.getDescription());
        dto.setCategory(s.getCategory());
        dto.setStatus(s.getStatus());
        dto.setOfficerRemarks(s.getOfficerRemarks());
        dto.setCreatedAt(s.getCreatedAt());
        return dto;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getSuggestionId() { return suggestionId; }
    public void setSuggestionId(String suggestionId) { this.suggestionId = suggestionId; }

    public Long getCitizenId() { return citizenId; }
    public void setCitizenId(Long citizenId) { this.citizenId = citizenId; }

    public String getCitizenName() { return citizenName; }
    public void setCitizenName(String citizenName) { this.citizenName = citizenName; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public SuggestionStatus getStatus() { return status; }
    public void setStatus(SuggestionStatus status) { this.status = status; }

    public String getOfficerRemarks() { return officerRemarks; }
    public void setOfficerRemarks(String officerRemarks) { this.officerRemarks = officerRemarks; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
