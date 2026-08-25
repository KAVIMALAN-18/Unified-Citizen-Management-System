package com.ucms.dto;

public class OfficerReviewRequest {
    private String status; // APPROVED, REJECTED, ADDITIONAL_VERIFICATION
    private String remarks;

    public OfficerReviewRequest() {
    }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }
}
