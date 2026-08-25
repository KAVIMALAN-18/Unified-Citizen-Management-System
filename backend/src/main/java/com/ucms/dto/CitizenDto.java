package com.ucms.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.ucms.model.Citizen;
import com.ucms.model.Gender;
import com.ucms.model.Role;

import java.math.BigDecimal;
import java.time.LocalDate;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class CitizenDto {

    private Long id;
    private String fullName;
    private String email;
    private String phoneNumber;
    private LocalDate dateOfBirth;
    private Gender gender;
    private String address;
    private String village;
    private String occupation;
    private BigDecimal annualIncome;
    private BigDecimal landArea;
    private Boolean farmerStatus;
    private Role role;

    public CitizenDto() {
    }

    public static CitizenDto fromEntity(Citizen citizen) {
        CitizenDto dto = new CitizenDto();
        dto.setId(citizen.getId());
        dto.setFullName(citizen.getFullName());
        dto.setEmail(citizen.getEmail());
        dto.setPhoneNumber(citizen.getPhoneNumber());
        dto.setDateOfBirth(citizen.getDateOfBirth());
        dto.setGender(citizen.getGender());
        dto.setAddress(citizen.getAddress());
        dto.setVillage(citizen.getVillage());
        dto.setOccupation(citizen.getOccupation());
        dto.setAnnualIncome(citizen.getAnnualIncome());
        dto.setLandArea(citizen.getLandArea());
        dto.setFarmerStatus(citizen.getFarmerStatus());
        dto.setRole(citizen.getRole());
        return dto;
    }

    public static CitizenDto forLogin(Citizen citizen) {
        CitizenDto dto = new CitizenDto();
        dto.setId(citizen.getId());
        dto.setFullName(citizen.getFullName());
        dto.setEmail(citizen.getEmail());
        dto.setRole(citizen.getRole());
        return dto;
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
}
