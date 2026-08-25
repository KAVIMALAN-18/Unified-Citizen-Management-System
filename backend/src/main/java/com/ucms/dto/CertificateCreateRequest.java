package com.ucms.dto;

import com.ucms.model.CertificateType;

public class CertificateCreateRequest {
    private CertificateType certificateType;
    private String submittedInfo;

    public CertificateCreateRequest() {
    }

    public CertificateType getCertificateType() { return certificateType; }
    public void setCertificateType(CertificateType certificateType) { this.certificateType = certificateType; }

    public String getSubmittedInfo() { return submittedInfo; }
    public void setSubmittedInfo(String submittedInfo) { this.submittedInfo = submittedInfo; }
}
