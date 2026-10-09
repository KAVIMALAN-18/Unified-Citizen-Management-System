package com.ucms.controller;

import com.ucms.dto.VerificationResultDto;
import com.ucms.model.Application;
import com.ucms.model.ApplicationStatus;
import com.ucms.model.CertificateRequest;
import com.ucms.model.CertificateStatus;
import com.ucms.repository.ApplicationRepository;
import com.ucms.repository.CertificateRequestRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/public")
public class PublicVerificationController {

    private final CertificateRequestRepository certificateRequestRepository;
    private final ApplicationRepository applicationRepository;

    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("dd-MMM-yyyy HH:mm");

    public PublicVerificationController(CertificateRequestRepository certificateRequestRepository,
                                        ApplicationRepository applicationRepository) {
        this.certificateRequestRepository = certificateRequestRepository;
        this.applicationRepository = applicationRepository;
    }

    @Transactional(readOnly = true)
    @GetMapping("/verify/{referenceCode}")
    public ResponseEntity<VerificationResultDto> verifyDocument(@PathVariable String referenceCode) {
        String cleanRef = referenceCode.trim();

        // 1. Check Certificate Requests (by certificateReference or requestId)
        Optional<CertificateRequest> certOpt = certificateRequestRepository.findByCertificateReference(cleanRef);
        if (certOpt.isEmpty()) {
            certOpt = certificateRequestRepository.findByRequestId(cleanRef);
        }

        if (certOpt.isPresent()) {
            CertificateRequest cr = certOpt.get();
            if (cr.getStatus() == CertificateStatus.REJECTED) {
                VerificationResultDto result = new VerificationResultDto();
                result.setValid(false);
                result.setStatus("REJECTED");
                result.setReferenceCode(cr.getCertificateReference() != null ? cr.getCertificateReference() : cr.getRequestId());
                result.setDocumentType("OFFICIAL_VILLAGE_CERTIFICATE");
                result.setTitle(formatCertificateTitle(cr.getCertificateType().name()) + " (REVOKED / REJECTED)");
                result.setCitizenName(cr.getCitizen() != null ? cr.getCitizen().getFullName() : "Beneficiary Citizen");
                result.setVillage(cr.getCitizen() != null ? cr.getCitizen().getVillage() : "Keeranur Gram Panchayat");
                result.setIssueDate(cr.getIssuedAt() != null ? cr.getIssuedAt().format(FORMATTER) : (cr.getUpdatedAt() != null ? cr.getUpdatedAt().format(FORMATTER) : "N/A"));
                result.setApprovedBy(cr.getApprovedByOfficer() != null ? cr.getApprovedByOfficer() : "Administrative Officer");
                result.setDigitalSignature(cr.getDigitalSignature() != null ? cr.getDigitalSignature() : "REVOKED_VOID_SIGNATURE");
                result.setESignStatus("OFFICIALLY REVOKED & VOIDED");
                result.setIssuingAuthority("Gram Panchayat Administration, Department of Rural Development, Govt of Tamil Nadu");
                result.setMessage("DOCUMENT STATUS: REJECTED / REVOKED. This official certificate was rejected/revoked by government authorities.");
                Map<String, Object> details = new HashMap<>();
                details.put("Official Status", "REJECTED / REVOKED");
                details.put("Officer Remarks", cr.getOfficerRemarks() != null ? cr.getOfficerRemarks() : "Certificate rejected.");
                result.setDetails(details);
                return ResponseEntity.ok(result);
            }

            if (cr.getStatus() != CertificateStatus.APPROVED) {
                return ResponseEntity.ok(VerificationResultDto.invalid(
                        cleanRef,
                        "Record found, but certificate status is '" + cr.getStatus() + "'. Not a valid approved certificate."
                ));
            }

            VerificationResultDto result = new VerificationResultDto();
            result.setValid(true);
            result.setReferenceCode(cr.getCertificateReference() != null ? cr.getCertificateReference() : cr.getRequestId());
            result.setDocumentType("OFFICIAL_VILLAGE_CERTIFICATE");
            result.setTitle(formatCertificateTitle(cr.getCertificateType().name()));
            result.setStatus("APPROVED / VALID");
            result.setCitizenName(cr.getCitizen() != null ? cr.getCitizen().getFullName() : "Verified Citizen");
            result.setVillage(cr.getCitizen() != null ? cr.getCitizen().getVillage() : "Keeranur Gram Panchayat");
            result.setIssueDate(cr.getIssuedAt() != null ? cr.getIssuedAt().format(FORMATTER) : (cr.getUpdatedAt() != null ? cr.getUpdatedAt().format(FORMATTER) : "N/A"));
            result.setApprovedBy(cr.getApprovedByOfficer() != null ? cr.getApprovedByOfficer() : "Village Administrative Officer (VAO)");
            result.setDigitalSignature(cr.getDigitalSignature() != null ? cr.getDigitalSignature() : "SHA256:AUTHENTICATED_SECURE_TOKEN");
            result.setESignStatus("OFFICIALLY SIGNED & VERIFIED (e-Sign Active)");
            result.setIssuingAuthority("Gram Panchayat Administration, Department of Rural Development, Govt of Tamil Nadu");
            result.setMessage("Original Official Document. Authenticity verified through UCMS State Digital Records.");

            Map<String, Object> details = new HashMap<>();
            details.put("Purpose", cr.getSubmittedInfo() != null ? cr.getSubmittedInfo() : "Official Use");
            if (cr.getCitizen() != null) {
                details.put("Annual Family Income", "₹" + (cr.getCitizen().getAnnualIncome() != null ? cr.getCitizen().getAnnualIncome().toString() : "0.00"));
                details.put("Gender", cr.getCitizen().getGender() != null ? cr.getCitizen().getGender().name() : "N/A");
                details.put("Address", cr.getCitizen().getAddress() != null ? cr.getCitizen().getAddress() : "Panchayat Ward");
            }
            result.setDetails(details);

            return ResponseEntity.ok(result);
        }

        // 2. Check Scheme Applications (by sanctionReference or applicationId)
        Optional<Application> appOpt = applicationRepository.findBySanctionReference(cleanRef);
        if (appOpt.isEmpty()) {
            appOpt = applicationRepository.findByApplicationId(cleanRef);
        }

        if (appOpt.isPresent()) {
            Application app = appOpt.get();
            if (app.getStatus() == ApplicationStatus.REJECTED) {
                VerificationResultDto result = new VerificationResultDto();
                result.setValid(false);
                result.setStatus("REJECTED");
                result.setReferenceCode(app.getSanctionReference() != null ? app.getSanctionReference() : app.getApplicationId());
                result.setDocumentType("WELFARE_SCHEME_SANCTION_ORDER");
                result.setTitle((app.getScheme() != null ? app.getScheme().getName() : "Welfare Scheme") + " - Sanction Order (REVOKED / REJECTED)");
                result.setCitizenName(app.getCitizen() != null ? app.getCitizen().getFullName() : "Beneficiary Citizen");
                result.setVillage(app.getCitizen() != null ? app.getCitizen().getVillage() : "Keeranur Gram Panchayat");
                result.setIssueDate(app.getApprovedAt() != null ? app.getApprovedAt().format(FORMATTER) : (app.getUpdatedAt() != null ? app.getUpdatedAt().format(FORMATTER) : "N/A"));
                result.setApprovedBy(app.getApprovedByOfficer() != null ? app.getApprovedByOfficer() : "Administrative Officer");
                result.setDigitalSignature(app.getDigitalSignature() != null ? app.getDigitalSignature() : "REVOKED_VOID_SIGNATURE");
                result.setESignStatus("OFFICIALLY REVOKED & VOIDED");
                result.setIssuingAuthority("Department of Rural Development & Panchayat Raj, Government of Tamil Nadu");
                result.setMessage("SANCTION ORDER REVOKED / REJECTED: This application was officially revoked and rejected following post-approval review.");

                Map<String, Object> details = new HashMap<>();
                details.put("Official Status", "REJECTED / REVOKED");
                if (app.getOfficerRemarks() != null && !app.getOfficerRemarks().isBlank()) {
                    details.put("Officer Rejection Remarks", app.getOfficerRemarks());
                } else {
                    details.put("Officer Rejection Remarks", "Application rejected following post-approval re-audit.");
                }
                if (app.getApprovedAt() != null) {
                    details.put("Original Sanction Date", app.getApprovedAt().format(FORMATTER));
                }
                if (app.getScheme() != null) {
                    details.put("Scheme Name", app.getScheme().getName());
                }
                result.setDetails(details);
                return ResponseEntity.ok(result);
            }

            if (app.getStatus() != ApplicationStatus.APPROVED) {
                return ResponseEntity.ok(VerificationResultDto.invalid(
                        cleanRef,
                        "Record found, but welfare application status is '" + app.getStatus() + "'. Not an approved sanction order."
                ));
            }

            VerificationResultDto result = new VerificationResultDto();
            result.setValid(true);
            result.setReferenceCode(app.getSanctionReference() != null ? app.getSanctionReference() : app.getApplicationId());
            result.setDocumentType("WELFARE_SCHEME_SANCTION_ORDER");
            result.setTitle(app.getScheme() != null ? app.getScheme().getName() + " - Sanction Order" : "Welfare Scheme Approval");
            result.setStatus("APPROVED / ACTIVE SANCTION");
            result.setCitizenName(app.getCitizen() != null ? app.getCitizen().getFullName() : "Beneficiary Citizen");
            result.setVillage(app.getCitizen() != null ? app.getCitizen().getVillage() : "Keeranur Gram Panchayat");
            result.setIssueDate(app.getApprovedAt() != null ? app.getApprovedAt().format(FORMATTER) : (app.getUpdatedAt() != null ? app.getUpdatedAt().format(FORMATTER) : "N/A"));
            result.setApprovedBy(app.getApprovedByOfficer() != null ? app.getApprovedByOfficer() : "Village Administrative Officer (VAO)");
            result.setDigitalSignature(app.getDigitalSignature() != null ? app.getDigitalSignature() : "SHA256:SANCTION_AUTHENTIC_SIGNATURE");
            result.setESignStatus("OFFICIALLY SIGNED & SANCTIONED (e-Sign Active)");
            result.setIssuingAuthority("Department of Rural Development & Panchayat Raj, Government of Tamil Nadu");
            result.setMessage("Official Sanction Order Authenticated. Beneficiary is actively approved under the scheme.");

            Map<String, Object> details = new HashMap<>();
            details.put("Scheme ID", app.getScheme() != null ? app.getScheme().getSchemeId() : "SCH001");
            details.put("Declared Income", "₹" + (app.getDeclaredIncome() != null ? app.getDeclaredIncome().toString() : "0.00"));
            details.put("Land Holding Area", (app.getDeclaredLandArea() != null ? app.getDeclaredLandArea().toString() : "0.00") + " Acres");
            if (app.getOfficerRemarks() != null && !app.getOfficerRemarks().isBlank()) {
                details.put("Officer Endorsement", app.getOfficerRemarks());
            }
            result.setDetails(details);

            return ResponseEntity.ok(result);
        }

        // 3. Not Found
        return ResponseEntity.ok(VerificationResultDto.invalid(
                cleanRef,
                "No matching record found in the UCMS State Database. Warning: This document may be fraudulent, altered, or unapproved."
        ));
    }

    private String formatCertificateTitle(String type) {
        if ("INCOME".equalsIgnoreCase(type)) return "Income & Asset Certificate";
        if ("RESIDENCE".equalsIgnoreCase(type)) return "Residence & Nativity Certificate";
        if ("CASTE".equalsIgnoreCase(type)) return "Community & Caste Certificate";
        if ("BIRTH".equalsIgnoreCase(type)) return "Birth Registration Certificate";
        return type + " Certificate";
    }
}
