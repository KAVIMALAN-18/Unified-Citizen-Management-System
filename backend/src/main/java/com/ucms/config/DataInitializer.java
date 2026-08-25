package com.ucms.config;

import com.ucms.model.*;
import com.ucms.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;

@Component
public class DataInitializer implements CommandLineRunner {

    private final CitizenRepository citizenRepository;
    private final SchemeRepository schemeRepository;
    private final DevelopmentWorkRepository developmentWorkRepository;
    private final BudgetRepository budgetRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(CitizenRepository citizenRepository,
                           SchemeRepository schemeRepository,
                           DevelopmentWorkRepository developmentWorkRepository,
                           BudgetRepository budgetRepository,
                           PasswordEncoder passwordEncoder) {
        this.citizenRepository = citizenRepository;
        this.schemeRepository = schemeRepository;
        this.developmentWorkRepository = developmentWorkRepository;
        this.budgetRepository = budgetRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        seedOfficerAccount();
        seedWelfareSchemes();
        seedVillageBudget();
        seedDevelopmentWorks();
    }

    private void seedOfficerAccount() {
        if (!citizenRepository.existsByEmail("officer@ucms.gov.in")) {
            Citizen officer = new Citizen();
            officer.setFullName("Village Administrative Officer");
            officer.setEmail("officer@ucms.gov.in");
            officer.setPhoneNumber("9876543210");
            officer.setPassword(passwordEncoder.encode("Officer@123"));
            officer.setDateOfBirth(LocalDate.of(1985, 5, 15));
            officer.setGender(Gender.MALE);
            officer.setAddress("Panchayat Office, Keeranur");
            officer.setVillage("Keeranur");
            officer.setOccupation("Administrative Officer");
            officer.setAnnualIncome(new BigDecimal("600000.00"));
            officer.setLandArea(BigDecimal.ZERO);
            officer.setFarmerStatus(false);
            officer.setRole(Role.OFFICER);
            citizenRepository.save(officer);
        }
    }

    private void seedWelfareSchemes() {
        createSchemeIfNotExists("SCH001", "Senior Citizen Support Allowance", "Monthly pension support for low income senior citizens aged 60 and above.", new BigDecimal("120000"), 60, 120, null, "Aadhaar Card, Income Certificate, Age Proof");
        createSchemeIfNotExists("SCH002", "Small & Marginal Farmer Cultivation Subsidy", "Financial support for seed, fertilizer, and agricultural equipment.", new BigDecimal("250000"), 18, 75, new BigDecimal("5.0"), "Land Revenue Record (Chitta), Bank Passbook, Farmer ID");
        createSchemeIfNotExists("SCH003", "Youth Education & Skill Assistance", "Financial scholarship and vocational training allowance for rural youth.", new BigDecimal("180000"), 18, 35, null, "Educational Marksheets, Income Certificate, Aadhaar");
        createSchemeIfNotExists("SCH004", "Rural Housing Construction Grant", "Grant for building permanent Pucca houses for low-income Kutcha housing dwellers.", new BigDecimal("100000"), 21, 80, new BigDecimal("2.0"), "House Ownership Proof, Ration Card, Bank Passbook");
        createSchemeIfNotExists("SCH005", "Rural Women Empowerment Loan Guarantee", "Zero-interest micro-finance loans for rural women entrepreneurs.", new BigDecimal("200000"), 18, 60, null, "Self-Help Group Card, Aadhaar, Ration Card");
    }

    private void createSchemeIfNotExists(String schemeId, String name, String description, BigDecimal incomeLimit, Integer ageMin, Integer ageMax, BigDecimal landLimit, String requiredDocuments) {
        if (!schemeRepository.existsBySchemeId(schemeId)) {
            Scheme s = new Scheme();
            s.setSchemeId(schemeId);
            s.setName(name);
            s.setDescription(description);
            s.setIncomeLimit(incomeLimit);
            s.setAgeMin(ageMin);
            s.setAgeMax(ageMax);
            s.setLandLimit(landLimit);
            s.setRequiredDocuments(requiredDocuments);
            s.setActive(true);
            schemeRepository.save(s);
        }
    }

    private void seedVillageBudget() {
        if (budgetRepository.findByFinancialYear("2025-2026").isEmpty()) {
            Budget b = new Budget();
            b.setFinancialYear("2025-2026");
            b.setTotalAllocation(new BigDecimal("5000000.00"));
            b.setAllocatedAmount(new BigDecimal("4200000.00"));
            b.setSpentAmount(new BigDecimal("2150000.00"));
            b.setRemainingAmount(new BigDecimal("2050000.00"));
            budgetRepository.save(b);
        }
    }

    private void seedDevelopmentWorks() {
        if (developmentWorkRepository.count() == 0) {
            DevelopmentWork w1 = new DevelopmentWork();
            w1.setWorkId("WRK1001");
            w1.setTitle("Main Village Tar Road Tarring");
            w1.setDescription("Resurfacing and widening of 3.5km primary connecting road.");
            w1.setCategory("Roads");
            w1.setLocation("Keeranur Main Street to Highway");
            w1.setEstimatedCost(new BigDecimal("1500000.00"));
            w1.setAllocatedAmount(new BigDecimal("1500000.00"));
            w1.setSpentAmount(new BigDecimal("950000.00"));
            w1.setStartDate(LocalDate.of(2025, 1, 10));
            w1.setExpectedCompletionDate(LocalDate.of(2025, 6, 30));
            w1.setProgressPercentage(65);
            w1.setStatus(WorkStatus.IN_PROGRESS);
            developmentWorkRepository.save(w1);

            DevelopmentWork w2 = new DevelopmentWork();
            w2.setWorkId("WRK1002");
            w2.setTitle("Overhead Solar Water Tank Tank Installation");
            w2.setDescription("50,000 liter water storage with solar pump integration.");
            w2.setCategory("Water Supply");
            w2.setLocation("Keeranur South Colony");
            w2.setEstimatedCost(new BigDecimal("800000.00"));
            w2.setAllocatedAmount(new BigDecimal("800000.00"));
            w2.setSpentAmount(new BigDecimal("800000.00"));
            w2.setStartDate(LocalDate.of(2024, 8, 1));
            w2.setExpectedCompletionDate(LocalDate.of(2024, 12, 15));
            w2.setActualCompletionDate(LocalDate.of(2024, 12, 10));
            w2.setProgressPercentage(100);
            w2.setStatus(WorkStatus.COMPLETED);
            developmentWorkRepository.save(w2);
        }
    }
}
