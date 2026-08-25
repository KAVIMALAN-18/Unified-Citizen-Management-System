package com.ucms.dto;

public class GrievanceCreateRequest {
    private String category;
    private String subject;
    private String description;
    private Long applicationId;

    public GrievanceCreateRequest() {
    }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Long getApplicationId() { return applicationId; }
    public void setApplicationId(Long applicationId) { this.applicationId = applicationId; }
}
