package com.ucms.dto;

import java.math.BigDecimal;

public class DashboardStatsDto {
    private long totalCitizens;
    private long totalApplications;
    private long pendingApplications;
    private long approvedApplications;
    private long rejectedApplications;
    private long pendingCertificateRequests;
    private long openGrievances;
    private long totalSuggestions;
    private long developmentWorks;
    private long completedWorks;
    private BigDecimal budgetAllocation;
    private BigDecimal amountSpent;
    private BigDecimal remainingBudget;

    public DashboardStatsDto() {
    }

    // Getters and Setters
    public long getTotalCitizens() { return totalCitizens; }
    public void setTotalCitizens(long totalCitizens) { this.totalCitizens = totalCitizens; }

    public long getTotalApplications() { return totalApplications; }
    public void setTotalApplications(long totalApplications) { this.totalApplications = totalApplications; }

    public long getPendingApplications() { return pendingApplications; }
    public void setPendingApplications(long pendingApplications) { this.pendingApplications = pendingApplications; }

    public long getApprovedApplications() { return approvedApplications; }
    public void setApprovedApplications(long approvedApplications) { this.approvedApplications = approvedApplications; }

    public long getRejectedApplications() { return rejectedApplications; }
    public void setRejectedApplications(long rejectedApplications) { this.rejectedApplications = rejectedApplications; }

    public long getPendingCertificateRequests() { return pendingCertificateRequests; }
    public void setPendingCertificateRequests(long pendingCertificateRequests) { this.pendingCertificateRequests = pendingCertificateRequests; }

    public long getOpenGrievances() { return openGrievances; }
    public void setOpenGrievances(long openGrievances) { this.openGrievances = openGrievances; }

    public long getTotalSuggestions() { return totalSuggestions; }
    public void setTotalSuggestions(long totalSuggestions) { this.totalSuggestions = totalSuggestions; }

    public long getDevelopmentWorks() { return developmentWorks; }
    public void setDevelopmentWorks(long developmentWorks) { this.developmentWorks = developmentWorks; }

    public long getCompletedWorks() { return completedWorks; }
    public void setCompletedWorks(long completedWorks) { this.completedWorks = completedWorks; }

    public BigDecimal getBudgetAllocation() { return budgetAllocation; }
    public void setBudgetAllocation(BigDecimal budgetAllocation) { this.budgetAllocation = budgetAllocation; }

    public BigDecimal getAmountSpent() { return amountSpent; }
    public void setAmountSpent(BigDecimal amountSpent) { this.amountSpent = amountSpent; }

    public BigDecimal getRemainingBudget() { return remainingBudget; }
    public void setRemainingBudget(BigDecimal remainingBudget) { this.remainingBudget = remainingBudget; }
}
