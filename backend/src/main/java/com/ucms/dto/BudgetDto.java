package com.ucms.dto;

import com.ucms.model.Budget;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class BudgetDto {
    private Long id;
    private String financialYear;
    private BigDecimal totalAllocation;
    private BigDecimal allocatedAmount;
    private BigDecimal spentAmount;
    private BigDecimal remainingAmount;
    private LocalDateTime createdAt;

    public BudgetDto() {
    }

    public static BudgetDto fromEntity(Budget b) {
        BudgetDto dto = new BudgetDto();
        dto.setId(b.getId());
        dto.setFinancialYear(b.getFinancialYear());
        dto.setTotalAllocation(b.getTotalAllocation());
        dto.setAllocatedAmount(b.getAllocatedAmount());
        dto.setSpentAmount(b.getSpentAmount());
        dto.setRemainingAmount(b.getRemainingAmount());
        dto.setCreatedAt(b.getCreatedAt());
        return dto;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getFinancialYear() { return financialYear; }
    public void setFinancialYear(String financialYear) { this.financialYear = financialYear; }

    public BigDecimal getTotalAllocation() { return totalAllocation; }
    public void setTotalAllocation(BigDecimal totalAllocation) { this.totalAllocation = totalAllocation; }

    public BigDecimal getAllocatedAmount() { return allocatedAmount; }
    public void setAllocatedAmount(BigDecimal allocatedAmount) { this.allocatedAmount = allocatedAmount; }

    public BigDecimal getSpentAmount() { return spentAmount; }
    public void setSpentAmount(BigDecimal spentAmount) { this.spentAmount = spentAmount; }

    public BigDecimal getRemainingAmount() { return remainingAmount; }
    public void setRemainingAmount(BigDecimal remainingAmount) { this.remainingAmount = remainingAmount; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
