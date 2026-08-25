package com.ucms.dto;

import com.ucms.model.DevelopmentWork;
import com.ucms.model.WorkStatus;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class DevelopmentWorkDto {
    private Long id;
    private String workId;
    private String title;
    private String description;
    private String category;
    private String location;
    private BigDecimal estimatedCost;
    private BigDecimal allocatedAmount;
    private BigDecimal spentAmount;
    private LocalDate startDate;
    private LocalDate expectedCompletionDate;
    private LocalDate actualCompletionDate;
    private Integer progressPercentage;
    private WorkStatus status;
    private LocalDateTime createdAt;

    public DevelopmentWorkDto() {
    }

    public static DevelopmentWorkDto fromEntity(DevelopmentWork dw) {
        DevelopmentWorkDto dto = new DevelopmentWorkDto();
        dto.setId(dw.getId());
        dto.setWorkId(dw.getWorkId());
        dto.setTitle(dw.getTitle());
        dto.setDescription(dw.getDescription());
        dto.setCategory(dw.getCategory());
        dto.setLocation(dw.getLocation());
        dto.setEstimatedCost(dw.getEstimatedCost());
        dto.setAllocatedAmount(dw.getAllocatedAmount());
        dto.setSpentAmount(dw.getSpentAmount());
        dto.setStartDate(dw.getStartDate());
        dto.setExpectedCompletionDate(dw.getExpectedCompletionDate());
        dto.setActualCompletionDate(dw.getActualCompletionDate());
        dto.setProgressPercentage(dw.getProgressPercentage());
        dto.setStatus(dw.getStatus());
        dto.setCreatedAt(dw.getCreatedAt());
        return dto;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getWorkId() { return workId; }
    public void setWorkId(String workId) { this.workId = workId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public BigDecimal getEstimatedCost() { return estimatedCost; }
    public void setEstimatedCost(BigDecimal estimatedCost) { this.estimatedCost = estimatedCost; }

    public BigDecimal getAllocatedAmount() { return allocatedAmount; }
    public void setAllocatedAmount(BigDecimal allocatedAmount) { this.allocatedAmount = allocatedAmount; }

    public BigDecimal getSpentAmount() { return spentAmount; }
    public void setSpentAmount(BigDecimal spentAmount) { this.spentAmount = spentAmount; }

    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }

    public LocalDate getExpectedCompletionDate() { return expectedCompletionDate; }
    public void setExpectedCompletionDate(LocalDate expectedCompletionDate) { this.expectedCompletionDate = expectedCompletionDate; }

    public LocalDate getActualCompletionDate() { return actualCompletionDate; }
    public void setActualCompletionDate(LocalDate actualCompletionDate) { this.actualCompletionDate = actualCompletionDate; }

    public Integer getProgressPercentage() { return progressPercentage; }
    public void setProgressPercentage(Integer progressPercentage) { this.progressPercentage = progressPercentage; }

    public WorkStatus getStatus() { return status; }
    public void setStatus(WorkStatus status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
