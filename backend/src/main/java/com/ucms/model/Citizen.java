package com.ucms.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "citizens")
public class Citizen {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "full_name", nullable = false)
    private String fullName;

    @Column(name = "email", nullable = false, unique = true)
    private String email;

    @Column(name = "phone_number", nullable = false)
    private String phoneNumber;

    @Column(name = "password", nullable = false)
    private String password;

    @Column(name = "date_of_birth", nullable = false)
    private LocalDate dateOfBirth;

    @Enumerated(EnumType.STRING)
    @Column(name = "gender", nullable = false)
    private Gender gender;

    @Column(name = "address", nullable = false, columnDefinition = "TEXT")
    private String address;

    @Column(name = "village", nullable = false)
    private String village;

    @Column(name = "occupation", nullable = false)
    private String occupation;

    @Column(name = "annual_income", nullable = false, precision = 12, scale = 2)
    private BigDecimal annualIncome;

    @Column(name = "land_area", nullable = false, precision = 10, scale = 2)
    private BigDecimal landArea;

    @Column(name = "farmer_status", nullable = false)
    private Boolean farmerStatus = false;

    @Column(name = "family_size")
    private Integer familySize = 4;

    @Column(name = "education_level")
    private String educationLevel = "Primary";

    @Column(name = "disability_status")
    private Boolean disabilityStatus = false;

    @Column(name = "marital_status")
    private String maritalStatus = "Single";

    @Column(name = "employment_status")
    private String employmentStatus = "Employed";

    @Column(name = "bank_account")
    private Boolean bankAccount = true;

    @Column(name = "ration_card")
    private String rationCard = "PHH";

    @Column(name = "aadhaar_verified")
    private Boolean aadhaarVerified = true;

    @Column(name = "housing_condition")
    private String housingCondition = "Pucca";

    @Column(name = "health_condition")
    private String healthCondition = "Good";

    @Column(name = "senior_citizen")
    private Boolean seniorCitizen = false;

    @Column(name = "previous_benefit_received")
    private Boolean previousBenefitReceived = false;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false)
    private Role role;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public Citizen() {
    }

    public Citizen(Long id, String fullName, String email, String phoneNumber, String password,
                   LocalDate dateOfBirth, Gender gender, String address, String village,
                   String occupation, BigDecimal annualIncome, BigDecimal landArea,
                   Boolean farmerStatus, Role role) {
        this.id = id;
        this.fullName = fullName;
        this.email = email;
        this.phoneNumber = phoneNumber;
        this.password = password;
        this.dateOfBirth = dateOfBirth;
        this.gender = gender;
        this.address = address;
        this.village = village;
        this.occupation = occupation;
        this.annualIncome = annualIncome;
        this.landArea = landArea;
        this.farmerStatus = farmerStatus;
        this.role = role;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public LocalDate getDateOfBirth() {
        return dateOfBirth;
    }

    public void setDateOfBirth(LocalDate dateOfBirth) {
        this.dateOfBirth = dateOfBirth;
    }

    public Gender getGender() {
        return gender;
    }

    public void setGender(Gender gender) {
        this.gender = gender;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getVillage() {
        return village;
    }

    public void setVillage(String village) {
        this.village = village;
    }

    public String getOccupation() {
        return occupation;
    }

    public void setOccupation(String occupation) {
        this.occupation = occupation;
    }

    public BigDecimal getAnnualIncome() {
        return annualIncome;
    }

    public void setAnnualIncome(BigDecimal annualIncome) {
        this.annualIncome = annualIncome;
    }

    public BigDecimal getLandArea() {
        return landArea;
    }

    public void setLandArea(BigDecimal landArea) {
        this.landArea = landArea;
    }

    public Boolean getFarmerStatus() {
        return farmerStatus;
    }

    public void setFarmerStatus(Boolean farmerStatus) {
        this.farmerStatus = farmerStatus;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public Integer getFamilySize() { return familySize; }
    public void setFamilySize(Integer familySize) { this.familySize = familySize; }

    public String getEducationLevel() { return educationLevel; }
    public void setEducationLevel(String educationLevel) { this.educationLevel = educationLevel; }

    public Boolean getDisabilityStatus() { return disabilityStatus; }
    public void setDisabilityStatus(Boolean disabilityStatus) { this.disabilityStatus = disabilityStatus; }

    public String getMaritalStatus() { return maritalStatus; }
    public void setMaritalStatus(String maritalStatus) { this.maritalStatus = maritalStatus; }

    public String getEmploymentStatus() { return employmentStatus; }
    public void setEmploymentStatus(String employmentStatus) { this.employmentStatus = employmentStatus; }

    public Boolean getBankAccount() { return bankAccount; }
    public void setBankAccount(Boolean bankAccount) { this.bankAccount = bankAccount; }

    public String getRationCard() { return rationCard; }
    public void setRationCard(String rationCard) { this.rationCard = rationCard; }

    public Boolean getAadhaarVerified() { return aadhaarVerified; }
    public void setAadhaarVerified(Boolean aadhaarVerified) { this.aadhaarVerified = aadhaarVerified; }

    public String getHousingCondition() { return housingCondition; }
    public void setHousingCondition(String housingCondition) { this.housingCondition = housingCondition; }

    public String getHealthCondition() { return healthCondition; }
    public void setHealthCondition(String healthCondition) { this.healthCondition = healthCondition; }

    public Boolean getSeniorCitizen() { return seniorCitizen; }
    public void setSeniorCitizen(Boolean seniorCitizen) { this.seniorCitizen = seniorCitizen; }

    public Boolean getPreviousBenefitReceived() { return previousBenefitReceived; }
    public void setPreviousBenefitReceived(Boolean previousBenefitReceived) { this.previousBenefitReceived = previousBenefitReceived; }
}
