package com.ucms.service;

import com.ucms.dto.SchemeDto;
import com.ucms.model.Citizen;
import com.ucms.model.Gender;
import com.ucms.model.Scheme;
import com.ucms.repository.CitizenRepository;
import com.ucms.repository.SchemeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.Period;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class SchemeService {

    private final SchemeRepository schemeRepository;
    private final CitizenRepository citizenRepository;

    public SchemeService(SchemeRepository schemeRepository, CitizenRepository citizenRepository) {
        this.schemeRepository = schemeRepository;
        this.citizenRepository = citizenRepository;
    }

    @Transactional(readOnly = true)
    public List<SchemeDto> getAllActiveSchemes() {
        return schemeRepository.findByActiveTrue()
                .stream()
                .map(SchemeDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public SchemeDto getSchemeBySchemeId(String schemeId) {
        Scheme scheme = schemeRepository.findBySchemeId(schemeId)
                .orElseThrow(() -> new IllegalArgumentException("Scheme not found with ID: " + schemeId));
        return SchemeDto.fromEntity(scheme);
    }

    @Transactional(readOnly = true)
    public List<SchemeDto> getRecommendedSchemes(String citizenEmail) {
        List<Scheme> allSchemes = schemeRepository.findByActiveTrue();
        if (citizenEmail == null || citizenEmail.isBlank()) {
            return allSchemes.stream().map(SchemeDto::fromEntity).collect(Collectors.toList());
        }

        Optional<Citizen> citizenOpt = citizenRepository.findByEmail(citizenEmail.trim().toLowerCase());
        if (citizenOpt.isEmpty()) {
            return allSchemes.stream().map(SchemeDto::fromEntity).collect(Collectors.toList());
        }

        Citizen citizen = citizenOpt.get();
        int age = citizen.getDateOfBirth() != null 
                ? Period.between(citizen.getDateOfBirth(), LocalDate.now()).getYears() 
                : 35;
        BigDecimal income = citizen.getAnnualIncome() != null ? citizen.getAnnualIncome() : BigDecimal.ZERO;
        BigDecimal land = citizen.getLandArea() != null ? citizen.getLandArea() : BigDecimal.ZERO;
        boolean isFarmer = Boolean.TRUE.equals(citizen.getFarmerStatus());
        Gender gender = citizen.getGender();
        String housing = citizen.getHousingCondition() != null ? citizen.getHousingCondition() : "Pucca";
        boolean aadhaar = Boolean.TRUE.equals(citizen.getAadhaarVerified());
        boolean bank = Boolean.TRUE.equals(citizen.getBankAccount());

        List<SchemeDto> recommended = new ArrayList<>();

        for (Scheme s : allSchemes) {
            SchemeDto dto = SchemeDto.fromEntity(s);
            boolean eligible = true;
            List<String> reasons = new ArrayList<>();
            List<String> missingDocs = new ArrayList<>();

            // 1. Age verification
            if (s.getAgeMin() != null && age < s.getAgeMin()) {
                eligible = false;
                reasons.add("Applicant age (" + age + " yrs) is below required minimum of " + s.getAgeMin() + " yrs.");
            } else if (s.getAgeMax() != null && age > s.getAgeMax()) {
                eligible = false;
                reasons.add("Applicant age (" + age + " yrs) exceeds maximum limit of " + s.getAgeMax() + " yrs.");
            } else {
                reasons.add("Age criterion met (" + age + " yrs is within " + s.getAgeMin() + "–" + s.getAgeMax() + " yrs).");
            }

            // 2. Income verification
            if (s.getIncomeLimit() != null && income.compareTo(s.getIncomeLimit()) > 0) {
                eligible = false;
                reasons.add("Annual income (₹" + income + ") exceeds ceiling of ₹" + s.getIncomeLimit() + ".");
            } else if (s.getIncomeLimit() != null) {
                reasons.add("Income threshold satisfied (₹" + income + " <= ₹" + s.getIncomeLimit() + ").");
            }

            // 3. Land holding verification
            if (s.getLandLimit() != null && land.compareTo(s.getLandLimit()) > 0) {
                eligible = false;
                reasons.add("Land area (" + land + " acres) exceeds maximum ceiling of " + s.getLandLimit() + " acres.");
            } else if (s.getLandLimit() != null) {
                reasons.add("Land area holding satisfied (" + land + " acres <= " + s.getLandLimit() + " acres).");
            }

            // 4. Scheme-specific targeting rules
            String code = s.getSchemeId() != null ? s.getSchemeId().toUpperCase() : "";
            if (code.contains("SCH002") || s.getName().toLowerCase().contains("farmer")) {
                if (!isFarmer) {
                    eligible = false;
                    reasons.add("Targeted benefit requires verified farmer status.");
                } else {
                    reasons.add("Registered agricultural farmer status confirmed.");
                }
            } else if (code.contains("SCH001") || s.getName().toLowerCase().contains("senior")) {
                if (age < 60) {
                    eligible = false;
                    reasons.add("Program reserved strictly for senior citizens aged 60+.");
                } else {
                    reasons.add("Senior citizen welfare status confirmed.");
                }
            } else if (code.contains("SCH005") || s.getName().toLowerCase().contains("women")) {
                if (gender != Gender.FEMALE) {
                    eligible = false;
                    reasons.add("Reserved exclusively for women entrepreneurs.");
                } else {
                    reasons.add("Women empowerment criterion satisfied.");
                }
            } else if (code.contains("SCH003") || s.getName().toLowerCase().contains("youth")) {
                if (age > 35) {
                    eligible = false;
                    reasons.add("Skill assistance targeted for rural youth (age <= 35).");
                } else {
                    reasons.add("Youth bracket category satisfied.");
                }
            } else if (code.contains("SCH004") || s.getName().toLowerCase().contains("housing")) {
                if ("Kutcha".equalsIgnoreCase(housing)) {
                    reasons.add("Priority high-need: Registered Kutcha shelter resident.");
                }
            }

            // Check missing documents
            String docs = s.getRequiredDocuments() != null ? s.getRequiredDocuments() : "";
            if (docs.contains("Aadhaar") && !aadhaar) missingDocs.add("Aadhaar Card");
            if (docs.contains("Bank") && !bank) missingDocs.add("Bank Passbook");
            if (docs.contains("Farmer") && !isFarmer) missingDocs.add("Farmer ID");
            if (docs.contains("Income") && income.compareTo(new BigDecimal("100000")) > 0) missingDocs.add("Income Certificate");

            // Multi-factor compatibility scoring
            int score = 0;
            String level = "INELIGIBLE";

            if (eligible) {
                double base = 50.0;

                // Financial need factor (up to 20 pts)
                if (s.getIncomeLimit() != null && s.getIncomeLimit().compareTo(BigDecimal.ZERO) > 0) {
                    double ratio = 1.0 - Math.min(1.0, income.doubleValue() / s.getIncomeLimit().doubleValue());
                    base += ratio * 20.0;
                }

                // Profile match specialization (up to 15 pts)
                if ((code.contains("SCH002") || s.getName().toLowerCase().contains("farmer")) && isFarmer) {
                    base += 15.0;
                } else if ((code.contains("SCH004") || s.getName().toLowerCase().contains("housing")) && "Kutcha".equalsIgnoreCase(housing)) {
                    base += 15.0;
                } else if ((code.contains("SCH001") || s.getName().toLowerCase().contains("senior")) && age >= 60) {
                    base += 15.0;
                } else if ((code.contains("SCH005") || s.getName().toLowerCase().contains("women")) && gender == Gender.FEMALE) {
                    base += 15.0;
                } else if ((code.contains("SCH003") || s.getName().toLowerCase().contains("youth")) && age <= 35) {
                    base += 15.0;
                } else {
                    base += 5.0;
                }

                // Document readiness factor (up to 15 pts)
                if (aadhaar) base += 8.0;
                if (bank) base += 7.0;

                score = (int) Math.round(Math.min(100.0, Math.max(0.0, base)));
                level = score >= 85 ? "HIGH" : (score >= 70 ? "GOOD" : "MODERATE");
            }

            dto.setEligible(eligible);
            dto.setMatchScore(score);
            dto.setMatchLevel(level);
            dto.setMatchReasons(reasons);
            dto.setMissingDocuments(missingDocs);

            recommended.add(dto);
        }

        // Sort: Eligible first, then descending by match score
        recommended.sort((a, b) -> {
            int comp = Boolean.compare(b.getEligible(), a.getEligible());
            if (comp != 0) return comp;
            return Integer.compare(b.getMatchScore(), a.getMatchScore());
        });

        return recommended;
    }
}
