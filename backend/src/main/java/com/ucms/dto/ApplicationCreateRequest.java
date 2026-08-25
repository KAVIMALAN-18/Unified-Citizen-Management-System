package com.ucms.dto;

import java.math.BigDecimal;

public class ApplicationCreateRequest {
    private String schemeId;
    private BigDecimal declaredIncome;
    private BigDecimal declaredLandArea;
    private Integer documentCount;

    public ApplicationCreateRequest() {
    }

    public String getSchemeId() { return schemeId; }
    public void setSchemeId(String schemeId) { this.schemeId = schemeId; }

    public BigDecimal getDeclaredIncome() { return declaredIncome; }
    public void setDeclaredIncome(BigDecimal declaredIncome) { this.declaredIncome = declaredIncome; }

    public BigDecimal getDeclaredLandArea() { return declaredLandArea; }
    public void setDeclaredLandArea(BigDecimal declaredLandArea) { this.declaredLandArea = declaredLandArea; }

    public Integer getDocumentCount() { return documentCount; }
    public void setDocumentCount(Integer documentCount) { this.documentCount = documentCount; }
}
