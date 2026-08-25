package com.ucms.dto;

import java.math.BigDecimal;

public class AiAnalysisRequest {

    private CitizenInfo citizen;
    private ApplicationInfo application;

    public AiAnalysisRequest() {
    }

    public AiAnalysisRequest(CitizenInfo citizen, ApplicationInfo application) {
        this.citizen = citizen;
        this.application = application;
    }

    public CitizenInfo getCitizen() {
        return citizen;
    }

    public void setCitizen(CitizenInfo citizen) {
        this.citizen = citizen;
    }

    public ApplicationInfo getApplication() {
        return application;
    }

    public void setApplication(ApplicationInfo application) {
        this.application = application;
    }

    public static class CitizenInfo {
        private String citizen_id;
        private int age;
        private String gender;
        private BigDecimal annual_income;
        private String occupation;
        private BigDecimal land_area;
        private int family_size;
        private String education_level;
        private boolean disability_status;
        private String marital_status;
        private String employment_status;
        private String village;
        private int existing_scheme_count;
        private boolean bank_account;
        private String ration_card;
        private boolean aadhaar_verified;
        private String housing_condition;
        private String health_condition;
        private boolean farmer_status;
        private boolean senior_citizen;
        private boolean previous_benefit_received;

        public CitizenInfo() {
        }

        // Getters and Setters
        public String getCitizen_id() { return citizen_id; }
        public void setCitizen_id(String citizen_id) { this.citizen_id = citizen_id; }

        public int getAge() { return age; }
        public void setAge(int age) { this.age = age; }

        public String getGender() { return gender; }
        public void setGender(String gender) { this.gender = gender; }

        public BigDecimal getAnnual_income() { return annual_income; }
        public void setAnnual_income(BigDecimal annual_income) { this.annual_income = annual_income; }

        public String getOccupation() { return occupation; }
        public void setOccupation(String occupation) { this.occupation = occupation; }

        public BigDecimal getLand_area() { return land_area; }
        public void setLand_area(BigDecimal land_area) { this.land_area = land_area; }

        public int getFamily_size() { return family_size; }
        public void setFamily_size(int family_size) { this.family_size = family_size; }

        public String getEducation_level() { return education_level; }
        public void setEducation_level(String education_level) { this.education_level = education_level; }

        public boolean isDisability_status() { return disability_status; }
        public void setDisability_status(boolean disability_status) { this.disability_status = disability_status; }

        public String getMarital_status() { return marital_status; }
        public void setMarital_status(String marital_status) { this.marital_status = marital_status; }

        public String getEmployment_status() { return employment_status; }
        public void setEmployment_status(String employment_status) { this.employment_status = employment_status; }

        public String getVillage() { return village; }
        public void setVillage(String village) { this.village = village; }

        public int getExisting_scheme_count() { return existing_scheme_count; }
        public void setExisting_scheme_count(int existing_scheme_count) { this.existing_scheme_count = existing_scheme_count; }

        public boolean isBank_account() { return bank_account; }
        public void setBank_account(boolean bank_account) { this.bank_account = bank_account; }

        public String getRation_card() { return ration_card; }
        public void setRation_card(String ration_card) { this.ration_card = ration_card; }

        public boolean isAadhaar_verified() { return aadhaar_verified; }
        public void setAadhaar_verified(boolean aadhaar_verified) { this.aadhaar_verified = aadhaar_verified; }

        public String getHousing_condition() { return housing_condition; }
        public void setHousing_condition(String housing_condition) { this.housing_condition = housing_condition; }

        public String getHealth_condition() { return health_condition; }
        public void setHealth_condition(String health_condition) { this.health_condition = health_condition; }

        public boolean isFarmer_status() { return farmer_status; }
        public void setFarmer_status(boolean farmer_status) { this.farmer_status = farmer_status; }

        public boolean isSenior_citizen() { return senior_citizen; }
        public void setSenior_citizen(boolean senior_citizen) { this.senior_citizen = senior_citizen; }

        public boolean isPrevious_benefit_received() { return previous_benefit_received; }
        public void setPrevious_benefit_received(boolean previous_benefit_received) { this.previous_benefit_received = previous_benefit_received; }
    }

    public static class ApplicationInfo {
        private String application_id;
        private String citizen_id;
        private String scheme_id;
        private BigDecimal declared_income;
        private BigDecimal declared_land_area;
        private int document_count;
        private String application_date;

        public ApplicationInfo() {
        }

        // Getters and Setters
        public String getApplication_id() { return application_id; }
        public void setApplication_id(String application_id) { this.application_id = application_id; }

        public String getCitizen_id() { return citizen_id; }
        public void setCitizen_id(String citizen_id) { this.citizen_id = citizen_id; }

        public String getScheme_id() { return scheme_id; }
        public void setScheme_id(String scheme_id) { this.scheme_id = scheme_id; }

        public BigDecimal getDeclared_income() { return declared_income; }
        public void setDeclared_income(BigDecimal declared_income) { this.declared_income = declared_income; }

        public BigDecimal getDeclared_land_area() { return declared_land_area; }
        public void setDeclared_land_area(BigDecimal declared_land_area) { this.declared_land_area = declared_land_area; }

        public int getDocument_count() { return document_count; }
        public void setDocument_count(int document_count) { this.document_count = document_count; }

        public String getApplication_date() { return application_date; }
        public void setApplication_date(String application_date) { this.application_date = application_date; }
    }
}
