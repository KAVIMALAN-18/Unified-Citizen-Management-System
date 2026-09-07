package com.ucms.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ucms.dto.*;
import com.ucms.model.*;
import com.ucms.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@SuppressWarnings("null")
@Service
public class OfficerService {

    private final CitizenRepository citizenRepository;
    private final ApplicationRepository applicationRepository;
    private final CertificateRequestRepository certificateRequestRepository;
    private final GrievanceRepository grievanceRepository;
    private final SuggestionRepository suggestionRepository;
    private final DevelopmentWorkRepository developmentWorkRepository;
    private final BudgetRepository budgetRepository;
    private final AiAnalysisRepository aiAnalysisRepository;
    private final AiService aiService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public OfficerService(CitizenRepository citizenRepository,
                          ApplicationRepository applicationRepository,
                          CertificateRequestRepository certificateRequestRepository,
                          GrievanceRepository grievanceRepository,
                          SuggestionRepository suggestionRepository,
                          DevelopmentWorkRepository developmentWorkRepository,
                          BudgetRepository budgetRepository,
                          AiAnalysisRepository aiAnalysisRepository,
                          AiService aiService) {
        this.citizenRepository = citizenRepository;
        this.applicationRepository = applicationRepository;
        this.certificateRequestRepository = certificateRequestRepository;
        this.grievanceRepository = grievanceRepository;
        this.suggestionRepository = suggestionRepository;
        this.developmentWorkRepository = developmentWorkRepository;
        this.budgetRepository = budgetRepository;
        this.aiAnalysisRepository = aiAnalysisRepository;
        this.aiService = aiService;
    }

    @Transactional(readOnly = true)
    public DashboardStatsDto getDashboardStats() {
        DashboardStatsDto stats = new DashboardStatsDto();
        stats.setTotalCitizens(citizenRepository.count());
        stats.setTotalApplications(applicationRepository.count());
        stats.setPendingApplications(applicationRepository.countByStatus(ApplicationStatus.PENDING) + applicationRepository.countByStatus(ApplicationStatus.UNDER_REVIEW));
        stats.setApprovedApplications(applicationRepository.countByStatus(ApplicationStatus.APPROVED));
        stats.setRejectedApplications(applicationRepository.countByStatus(ApplicationStatus.REJECTED));

        stats.setPendingCertificateRequests(certificateRequestRepository.countByStatus(CertificateStatus.SUBMITTED) + certificateRequestRepository.countByStatus(CertificateStatus.UNDER_REVIEW));
        stats.setOpenGrievances(grievanceRepository.countByStatus(GrievanceStatus.SUBMITTED) + grievanceRepository.countByStatus(GrievanceStatus.UNDER_REVIEW));
        stats.setTotalSuggestions(suggestionRepository.count());

        stats.setDevelopmentWorks(developmentWorkRepository.count());
        stats.setCompletedWorks(developmentWorkRepository.countByStatus(WorkStatus.COMPLETED));

        Budget latestBudget = budgetRepository.findTopByOrderByFinancialYearDesc().orElse(null);
        if (latestBudget != null) {
            stats.setBudgetAllocation(latestBudget.getAllocatedAmount());
            stats.setAmountSpent(latestBudget.getSpentAmount());
            stats.setRemainingBudget(latestBudget.getRemainingAmount());
        } else {
            stats.setBudgetAllocation(BigDecimal.ZERO);
            stats.setAmountSpent(BigDecimal.ZERO);
            stats.setRemainingBudget(BigDecimal.ZERO);
        }

        return stats;
    }

    @Transactional(readOnly = true)
    public List<ApplicationDto> getAllApplications() {
        return applicationRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(ApplicationDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public AiAnalysisResponse triggerAiAnalysis(Long applicationId) {
        Application app = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new IllegalArgumentException("Application not found with id: " + applicationId));

        Citizen citizen = app.getCitizen();
        if (citizen == null) {
            throw new IllegalArgumentException("Application ID " + applicationId + " does not have an associated citizen profile.");
        }

        // Build AiAnalysisRequest
        AiAnalysisRequest.CitizenInfo cInfo = new AiAnalysisRequest.CitizenInfo();
        cInfo.setCitizen_id(citizen.getEmail());
        cInfo.setAge(citizen.getDateOfBirth() != null ? (java.time.Period.between(citizen.getDateOfBirth(), java.time.LocalDate.now()).getYears()) : 35);
        cInfo.setGender(citizen.getGender() != null ? citizen.getGender().name() : "Male");
        cInfo.setAnnual_income(citizen.getAnnualIncome() != null ? citizen.getAnnualIncome() : new BigDecimal("75000"));
        cInfo.setOccupation(citizen.getOccupation() != null ? citizen.getOccupation() : "Worker");
        cInfo.setLand_area(citizen.getLandArea() != null ? citizen.getLandArea() : BigDecimal.ZERO);
        cInfo.setFamily_size(citizen.getFamilySize() != null ? citizen.getFamilySize() : 4);
        cInfo.setEducation_level(citizen.getEducationLevel() != null ? citizen.getEducationLevel() : "Primary");
        cInfo.setDisability_status(Boolean.TRUE.equals(citizen.getDisabilityStatus()));
        cInfo.setMarital_status(citizen.getMaritalStatus() != null ? citizen.getMaritalStatus() : "Single");
        cInfo.setEmployment_status(citizen.getEmploymentStatus() != null ? citizen.getEmploymentStatus() : "Employed");
        cInfo.setVillage(citizen.getVillage() != null ? citizen.getVillage() : " Keeranur");
        cInfo.setExisting_scheme_count(0);
        cInfo.setBank_account(Boolean.TRUE.equals(citizen.getBankAccount()));
        cInfo.setRation_card(citizen.getRationCard() != null ? citizen.getRationCard() : "PHH");
        cInfo.setAadhaar_verified(Boolean.TRUE.equals(citizen.getAadhaarVerified()));
        cInfo.setHousing_condition(citizen.getHousingCondition() != null ? citizen.getHousingCondition() : "Pucca");
        cInfo.setHealth_condition(citizen.getHealthCondition() != null ? citizen.getHealthCondition() : "Good");
        cInfo.setFarmer_status(Boolean.TRUE.equals(citizen.getFarmerStatus()));
        cInfo.setSenior_citizen(Boolean.TRUE.equals(citizen.getSeniorCitizen()));
        cInfo.setPrevious_benefit_received(Boolean.TRUE.equals(citizen.getPreviousBenefitReceived()));

        AiAnalysisRequest.ApplicationInfo aInfo = new AiAnalysisRequest.ApplicationInfo();
        aInfo.setApplication_id(app.getApplicationId());
        aInfo.setCitizen_id(citizen.getEmail());
        aInfo.setScheme_id(app.getScheme() != null ? app.getScheme().getSchemeId() : "SCH001");
        aInfo.setDeclared_income(app.getDeclaredIncome());
        aInfo.setDeclared_land_area(app.getDeclaredLandArea());
        aInfo.setDocument_count(app.getDocumentCount());
        aInfo.setApplication_date(app.getApplicationDate().toString());

        AiAnalysisRequest request = new AiAnalysisRequest(cInfo, aInfo);

        // Invoke FastAPI via AiService with local fallback if offline
        AiAnalysisResponse response;
        try {
            response = aiService.analyze(request);
        } catch (Exception e) {
            response = calculateLocalFallbackFraudAnalysis(citizen, app);
        }

        // Store or update AiAnalysis record
        AiAnalysis aiRecord = aiAnalysisRepository.findByApplicationId(app.getId()).orElse(new AiAnalysis());
        aiRecord.setApplication(app);
        aiRecord.setPrediction(response.getFraud_analysis().getPrediction());
        aiRecord.setFraudProbability(response.getFraud_analysis().getFraud_probability());
        aiRecord.setFraudRiskLevel(response.getFraud_analysis().getRisk_level());
        aiRecord.setVerificationRequirement(response.getFraud_analysis().getVerification_requirement());
        
        try {
            aiRecord.setShapExplanation(objectMapper.writeValueAsString(response.getExplanation()));
        } catch (Exception e) {
            aiRecord.setShapExplanation(response.getExplanation() != null ? response.getExplanation().getHuman_readable_explanation() : "");
        }
        aiRecord.setAiAnalysisStatus(AiAnalysisStatus.PENDING_OFFICER_REVIEW);

        aiAnalysisRepository.save(aiRecord);

        // Update application AI status
        app.setAiAnalysisStatus(AiAnalysisStatus.PENDING_OFFICER_REVIEW);
        if (app.getStatus() == ApplicationStatus.PENDING) {
            app.setStatus(ApplicationStatus.UNDER_REVIEW);
        }
        applicationRepository.save(app);

        return response;
    }

    private AiAnalysisResponse calculateLocalFallbackFraudAnalysis(Citizen citizen, Application app) {
        double declaredInc = app.getDeclaredIncome() != null ? app.getDeclaredIncome().doubleValue() : 0.0;
        double actualInc = citizen.getAnnualIncome() != null ? citizen.getAnnualIncome().doubleValue() : 75000.0;
        double incDevPct = Math.abs(declaredInc - actualInc) / Math.max(actualInc, 1.0) * 100.0;

        double declaredLand = app.getDeclaredLandArea() != null ? app.getDeclaredLandArea().doubleValue() : 0.0;
        double actualLand = citizen.getLandArea() != null ? citizen.getLandArea().doubleValue() : 0.0;
        double landDevPct = actualLand > 0 ? Math.abs(declaredLand - actualLand) / actualLand * 100.0 : (declaredLand > 0 ? declaredLand * 100.0 : 0.0);

        int docCount = app.getDocumentCount() != null ? app.getDocumentCount() : 0;
        double docCompleteness = Math.min(1.0, docCount / 4.0);

        double fraudProb = Math.min(1.0, (incDevPct * 0.4 + landDevPct * 0.4 + (1.0 - docCompleteness) * 20.0) / 100.0);
        fraudProb = Math.round(fraudProb * 10000.0) / 10000.0;

        String prediction = fraudProb >= 0.5 ? "FRAUD" : "NORMAL";
        String riskLevel = fraudProb <= 0.30 ? "LOW" : (fraudProb <= 0.70 ? "MEDIUM" : "HIGH");
        String verification = fraudProb <= 0.30 ? "Standard Verification" : (fraudProb <= 0.70 ? "Additional Document Verification" : "Enhanced Manual Verification");

        AiAnalysisResponse res = new AiAnalysisResponse();
        res.setCitizen_id(citizen.getEmail());
        res.setApplication_id(app.getApplicationId());
        res.setFinal_status("PENDING_OFFICER_REVIEW");
        res.setOfficer_decision_required(true);

        AiAnalysisResponse.FraudAnalysisOutput fraud = new AiAnalysisResponse.FraudAnalysisOutput();
        fraud.setPrediction(prediction);
        fraud.setFraud_probability(fraudProb);
        fraud.setRisk_level(riskLevel);
        fraud.setVerification_requirement(verification);
        res.setFraud_analysis(fraud);

        AiAnalysisResponse.ExplanationOutput exp = new AiAnalysisResponse.ExplanationOutput();
        exp.setHuman_readable_explanation("Local Rule Engine Assessment: Income mismatch deviation is " + String.format("%.1f", incDevPct) + "% and land area mismatch deviation is " + String.format("%.1f", landDevPct) + "%. Recommended Verification: " + verification + ".");
        res.setExplanation(exp);

        return res;
    }


    @Transactional
    public ApplicationDto reviewApplication(Long applicationId, OfficerReviewRequest reviewRequest) {
        Application app = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new IllegalArgumentException("Application not found with id: " + applicationId));

        String targetStatus = reviewRequest.getStatus().trim().toUpperCase();
        ApplicationStatus newStatus = ApplicationStatus.valueOf(targetStatus);
        
        app.setStatus(newStatus);
        if (reviewRequest.getRemarks() != null) {
            app.setOfficerRemarks(reviewRequest.getRemarks().trim());
        }

        Application saved = applicationRepository.save(app);
        return ApplicationDto.fromEntity(saved);
    }

    @Transactional(readOnly = true)
    public List<CertificateRequestDto> getAllCertificateRequests() {
        return certificateRequestRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(CertificateRequestDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public CertificateRequestDto reviewCertificate(Long requestId, OfficerReviewRequest reviewRequest) {
        CertificateRequest cr = certificateRequestRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Certificate request not found"));

        CertificateStatus newStatus = CertificateStatus.valueOf(reviewRequest.getStatus().trim().toUpperCase());
        cr.setStatus(newStatus);
        if (reviewRequest.getRemarks() != null) {
            cr.setOfficerRemarks(reviewRequest.getRemarks().trim());
        }

        if (newStatus == CertificateStatus.APPROVED && cr.getCertificateReference() == null) {
            cr.setCertificateReference("CERT-" + cr.getCertificateType().name() + "-2026-" + (System.currentTimeMillis() % 100000));
        }

        CertificateRequest saved = certificateRequestRepository.save(cr);
        return CertificateRequestDto.fromEntity(saved);
    }

    @Transactional(readOnly = true)
    public List<GrievanceDto> getAllGrievances() {
        return grievanceRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(GrievanceDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public GrievanceDto respondGrievance(Long grievanceId, OfficerResponseRequest responseRequest) {
        Grievance g = grievanceRepository.findById(grievanceId)
                .orElseThrow(() -> new IllegalArgumentException("Grievance not found"));

        if (responseRequest.getStatus() != null) {
            g.setStatus(GrievanceStatus.valueOf(responseRequest.getStatus().trim().toUpperCase()));
        } else {
            g.setStatus(GrievanceStatus.RESOLVED);
        }

        if (responseRequest.getResponse() != null) {
            g.setOfficerResponse(responseRequest.getResponse().trim());
        }

        Grievance saved = grievanceRepository.save(g);
        return GrievanceDto.fromEntity(saved);
    }

    @Transactional(readOnly = true)
    public List<SuggestionDto> getAllSuggestions() {
        return suggestionRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(SuggestionDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public SuggestionDto updateSuggestionStatus(Long suggestionId, OfficerReviewRequest reviewRequest) {
        Suggestion s = suggestionRepository.findById(suggestionId)
                .orElseThrow(() -> new IllegalArgumentException("Suggestion not found"));

        s.setStatus(SuggestionStatus.valueOf(reviewRequest.getStatus().trim().toUpperCase()));
        if (reviewRequest.getRemarks() != null) {
            s.setOfficerRemarks(reviewRequest.getRemarks().trim());
        }

        Suggestion saved = suggestionRepository.save(s);
        return SuggestionDto.fromEntity(saved);
    }

    @Transactional(readOnly = true)
    public List<DevelopmentWorkDto> getAllDevelopmentWorks() {
        return developmentWorkRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(DevelopmentWorkDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public DevelopmentWorkDto createDevelopmentWork(DevelopmentWorkDto dto) {
        DevelopmentWork dw = new DevelopmentWork();
        dw.setWorkId("WRK" + System.currentTimeMillis() % 1000000);
        dw.setTitle(dto.getTitle().trim());
        dw.setDescription(dto.getDescription() != null ? dto.getDescription().trim() : "");
        dw.setCategory(dto.getCategory().trim());
        dw.setLocation(dto.getLocation().trim());
        dw.setEstimatedCost(dto.getEstimatedCost());
        dw.setAllocatedAmount(dto.getAllocatedAmount());
        dw.setSpentAmount(dto.getSpentAmount() != null ? dto.getSpentAmount() : BigDecimal.ZERO);
        dw.setStartDate(dto.getStartDate());
        dw.setExpectedCompletionDate(dto.getExpectedCompletionDate());
        dw.setProgressPercentage(dto.getProgressPercentage() != null ? dto.getProgressPercentage() : 0);
        dw.setStatus(dto.getStatus() != null ? dto.getStatus() : WorkStatus.PLANNED);

        DevelopmentWork saved = developmentWorkRepository.save(dw);
        return DevelopmentWorkDto.fromEntity(saved);
    }

    @Transactional
    public DevelopmentWorkDto updateDevelopmentWork(Long id, DevelopmentWorkDto dto) {
        DevelopmentWork dw = developmentWorkRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Development work not found"));

        if (dto.getTitle() != null) dw.setTitle(dto.getTitle().trim());
        if (dto.getDescription() != null) dw.setDescription(dto.getDescription().trim());
        if (dto.getCategory() != null) dw.setCategory(dto.getCategory().trim());
        if (dto.getLocation() != null) dw.setLocation(dto.getLocation().trim());
        if (dto.getEstimatedCost() != null) dw.setEstimatedCost(dto.getEstimatedCost());
        if (dto.getAllocatedAmount() != null) dw.setAllocatedAmount(dto.getAllocatedAmount());
        if (dto.getSpentAmount() != null) dw.setSpentAmount(dto.getSpentAmount());
        if (dto.getProgressPercentage() != null) dw.setProgressPercentage(dto.getProgressPercentage());
        if (dto.getStatus() != null) dw.setStatus(dto.getStatus());
        if (dto.getActualCompletionDate() != null) dw.setActualCompletionDate(dto.getActualCompletionDate());

        DevelopmentWork saved = developmentWorkRepository.save(dw);
        return DevelopmentWorkDto.fromEntity(saved);
    }

    @Transactional(readOnly = true)
    public BudgetDto getLatestBudget() {
        Budget b = budgetRepository.findTopByOrderByFinancialYearDesc()
                .orElseThrow(() -> new IllegalArgumentException("No budget records found"));
        return BudgetDto.fromEntity(b);
    }

    @Transactional
    public BudgetDto updateBudget(BudgetDto dto) {
        Budget b = budgetRepository.findByFinancialYear(dto.getFinancialYear())
                .orElse(new Budget());

        b.setFinancialYear(dto.getFinancialYear());
        b.setTotalAllocation(dto.getTotalAllocation());
        b.setAllocatedAmount(dto.getAllocatedAmount());

        BigDecimal spent = dto.getSpentAmount() != null ? dto.getSpentAmount() : BigDecimal.ZERO;
        if (spent.compareTo(dto.getAllocatedAmount()) > 0) {
            throw new IllegalArgumentException("Spent amount cannot exceed allocated amount");
        }

        b.setSpentAmount(spent);
        b.setRemainingAmount(dto.getAllocatedAmount().subtract(spent));

        Budget saved = budgetRepository.save(b);
        return BudgetDto.fromEntity(saved);
    }

    @Transactional(readOnly = true)
    public AiAnalysisResponse getAiAnalysis(Long applicationId) {
        Application app = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new IllegalArgumentException("Application not found with id: " + applicationId));

        AiAnalysis aiRecord = aiAnalysisRepository.findByApplicationId(app.getId())
                .orElseThrow(() -> new IllegalArgumentException("AI analysis not found for application id: " + applicationId));

        AiAnalysisResponse response = new AiAnalysisResponse();
        response.setCitizen_id(app.getCitizen() != null ? app.getCitizen().getEmail() : "");
        response.setApplication_id(app.getApplicationId());
        response.setFinal_status(aiRecord.getAiAnalysisStatus().name());
        response.setOfficer_decision_required(true);

        AiAnalysisResponse.FraudAnalysisOutput fraud = new AiAnalysisResponse.FraudAnalysisOutput();
        fraud.setPrediction(aiRecord.getPrediction());
        fraud.setFraud_probability(aiRecord.getFraudProbability());
        fraud.setRisk_level(aiRecord.getFraudRiskLevel());
        fraud.setVerification_requirement(aiRecord.getVerificationRequirement());
        response.setFraud_analysis(fraud);

        if (aiRecord.getShapExplanation() != null && !aiRecord.getShapExplanation().isEmpty()) {
            try {
                AiAnalysisResponse.ExplanationOutput explanation = objectMapper.readValue(
                        aiRecord.getShapExplanation(), AiAnalysisResponse.ExplanationOutput.class);
                response.setExplanation(explanation);
            } catch (Exception e) {
                AiAnalysisResponse.ExplanationOutput explanation = new AiAnalysisResponse.ExplanationOutput();
                explanation.setHuman_readable_explanation(aiRecord.getShapExplanation());
                response.setExplanation(explanation);
            }
        }

        return response;
    }
}
