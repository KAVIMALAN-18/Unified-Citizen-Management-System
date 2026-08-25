package com.ucms.dto;

import com.ucms.model.Scheme;

import java.math.BigDecimal;

public class SchemeDto {
    private Long id;
    private String schemeId;
    private String name;
    private String description;
    private BigDecimal incomeLimit;
    private Integer ageMin;
    private Integer ageMax;
    private BigDecimal landLimit;
    private String requiredDocuments;
    private Boolean active;

    public SchemeDto() {
    }

    public static SchemeDto fromEntity(Scheme scheme) {
        SchemeDto dto = new SchemeDto();
        dto.setId(scheme.getId());
        dto.setSchemeId(scheme.getSchemeId());
        dto.setName(scheme.getName());
        dto.setDescription(scheme.getDescription());
        dto.setIncomeLimit(scheme.getIncomeLimit());
        dto.setAgeMin(scheme.getAgeMin());
        dto.setAgeMax(scheme.getAgeMax());
        dto.setLandLimit(scheme.getLandLimit());
        dto.setRequiredDocuments(scheme.getRequiredDocuments());
        dto.setActive(scheme.getActive());
        return dto;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getSchemeId() { return schemeId; }
    public void setSchemeId(String schemeId) { this.schemeId = schemeId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public BigDecimal getIncomeLimit() { return incomeLimit; }
    public void setIncomeLimit(BigDecimal incomeLimit) { this.incomeLimit = incomeLimit; }

    public Integer getAgeMin() { return ageMin; }
    public void setAgeMin(Integer ageMin) { this.ageMin = ageMin; }

    public Integer getAgeMax() { return ageMax; }
    public void setAgeMax(Integer ageMax) { this.ageMax = ageMax; }

    public BigDecimal getLandLimit() { return landLimit; }
    public void setLandLimit(BigDecimal landLimit) { this.landLimit = landLimit; }

    public String getRequiredDocuments() { return requiredDocuments; }
    public void setRequiredDocuments(String requiredDocuments) { this.requiredDocuments = requiredDocuments; }

    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }
}
