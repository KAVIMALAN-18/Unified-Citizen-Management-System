package com.ucms.service;

import com.ucms.dto.ApplicationCreateRequest;
import com.ucms.dto.ApplicationDto;
import com.ucms.dto.DocumentDto;
import com.ucms.model.*;
import com.ucms.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.Period;
import java.util.List;
import java.util.stream.Collectors;

@SuppressWarnings("null")
@Service
public class ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final CitizenRepository citizenRepository;
    private final SchemeRepository schemeRepository;
    private final DocumentRepository documentRepository;

    public ApplicationService(ApplicationRepository applicationRepository,
                              CitizenRepository citizenRepository,
                              SchemeRepository schemeRepository,
                              DocumentRepository documentRepository) {
        this.applicationRepository = applicationRepository;
        this.citizenRepository = citizenRepository;
        this.schemeRepository = schemeRepository;
        this.documentRepository = documentRepository;
    }

    @Transactional
    public ApplicationDto createApplication(String citizenEmail, ApplicationCreateRequest request) {
        Citizen citizen = citizenRepository.findByEmail(citizenEmail.trim().toLowerCase())
                .orElseThrow(() -> new IllegalArgumentException("Citizen profile not found"));

        Scheme scheme = schemeRepository.findBySchemeId(request.getSchemeId())
                .orElseThrow(() -> new IllegalArgumentException("Scheme not found with ID: " + request.getSchemeId()));

        if (Boolean.FALSE.equals(scheme.getActive())) {
            throw new IllegalArgumentException("This welfare scheme is currently inactive.");
        }

        int age = citizen.getDateOfBirth() != null 
                ? Period.between(citizen.getDateOfBirth(), LocalDate.now()).getYears() 
                : 35;

        if (scheme.getAgeMin() != null && age < scheme.getAgeMin()) {
            throw new IllegalArgumentException("Ineligible: Applicant age (" + age + " yrs) is below minimum required of " + scheme.getAgeMin() + " yrs.");
        }
        if (scheme.getAgeMax() != null && age > scheme.getAgeMax()) {
            throw new IllegalArgumentException("Ineligible: Applicant age (" + age + " yrs) exceeds maximum limit of " + scheme.getAgeMax() + " yrs.");
        }
        if (scheme.getIncomeLimit() != null && citizen.getAnnualIncome() != null && citizen.getAnnualIncome().compareTo(scheme.getIncomeLimit()) > 0) {
            throw new IllegalArgumentException("Ineligible: Applicant annual income exceeds scheme ceiling of INR " + scheme.getIncomeLimit());
        }
        if (scheme.getLandLimit() != null && citizen.getLandArea() != null && citizen.getLandArea().compareTo(scheme.getLandLimit()) > 0) {
            throw new IllegalArgumentException("Ineligible: Land holding exceeds maximum ceiling of " + scheme.getLandLimit() + " acres.");
        }
        if ("SCH002".equalsIgnoreCase(scheme.getSchemeId()) && !Boolean.TRUE.equals(citizen.getFarmerStatus())) {
            throw new IllegalArgumentException("Ineligible: Program requires registered agricultural farmer status.");
        }
        if ("SCH005".equalsIgnoreCase(scheme.getSchemeId()) && citizen.getGender() != null && !"FEMALE".equalsIgnoreCase(citizen.getGender().name())) {
            throw new IllegalArgumentException("Ineligible: Program is reserved exclusively for women entrepreneurs.");
        }

        Application app = new Application();
        app.setApplicationId("APP" + System.currentTimeMillis() % 1000000);
        app.setCitizen(citizen);
        app.setScheme(scheme);
        app.setApplicationDate(LocalDate.now());
        app.setDeclaredIncome(request.getDeclaredIncome());
        app.setDeclaredLandArea(request.getDeclaredLandArea());
        app.setDocumentCount(request.getDocumentCount() != null ? request.getDocumentCount() : 1);
        app.setStatus(ApplicationStatus.PENDING);
        app.setAiAnalysisStatus(AiAnalysisStatus.NOT_ANALYZED);

        Application saved = applicationRepository.save(app);
        return ApplicationDto.fromEntity(saved);
    }

    @Transactional(readOnly = true)
    public List<ApplicationDto> getCitizenApplications(String citizenEmail) {
        Citizen citizen = citizenRepository.findByEmail(citizenEmail.trim().toLowerCase())
                .orElseThrow(() -> new IllegalArgumentException("Citizen profile not found"));

        return applicationRepository.findByCitizenIdOrderByCreatedAtDesc(citizen.getId())
                .stream()
                .map(ApplicationDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ApplicationDto getApplicationDetails(Long id, String citizenEmail) {
        Citizen citizen = citizenRepository.findByEmail(citizenEmail.trim().toLowerCase())
                .orElseThrow(() -> new IllegalArgumentException("Citizen profile not found"));

        Application app = applicationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Application not found with id: " + id));

        // Authorization check: Citizen can only view their own application (unless Officer)
        if (!app.getCitizen().getId().equals(citizen.getId()) && citizen.getRole() != Role.OFFICER) {
            throw new IllegalArgumentException("Unauthorized access to application");
        }

        return ApplicationDto.fromEntity(app);
    }

    @Transactional
    public DocumentDto uploadDocument(Long applicationId, String citizenEmail, String documentType, String fileName, String filePath) {
        Citizen citizen = citizenRepository.findByEmail(citizenEmail.trim().toLowerCase())
                .orElseThrow(() -> new IllegalArgumentException("Citizen profile not found"));

        Application app = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new IllegalArgumentException("Application not found"));

        DocumentEntity doc = new DocumentEntity();
        doc.setApplication(app);
        doc.setCitizen(citizen);
        doc.setDocumentType(documentType);
        doc.setFileName(fileName);
        doc.setFilePath(filePath);
        doc.setUploadStatus("COMPLETED");
        doc.setVerificationStatus("PENDING");

        DocumentEntity saved = documentRepository.save(doc);

        // Update document count on application
        app.setDocumentCount(app.getDocumentCount() + 1);
        applicationRepository.save(app);

        return DocumentDto.fromEntity(saved);
    }
}
