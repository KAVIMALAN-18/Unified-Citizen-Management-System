package com.ucms.dto;

import java.util.List;

public class AiAnalysisResponse {

    private String citizen_id;
    private String application_id;
    private ProfileOutput profile;
    private List<RecommendationItem> recommendations;
    private FraudAnalysisOutput fraud_analysis;
    private ExplanationOutput explanation;
    private String final_status;
    private boolean officer_decision_required;

    public AiAnalysisResponse() {
    }

    // Getters and Setters
    public String getCitizen_id() { return citizen_id; }
    public void setCitizen_id(String citizen_id) { this.citizen_id = citizen_id; }

    public String getApplication_id() { return application_id; }
    public void setApplication_id(String application_id) { this.application_id = application_id; }

    public ProfileOutput getProfile() { return profile; }
    public void setProfile(ProfileOutput profile) { this.profile = profile; }

    public List<RecommendationItem> getRecommendations() { return recommendations; }
    public void setRecommendations(List<RecommendationItem> recommendations) { this.recommendations = recommendations; }

    public FraudAnalysisOutput getFraud_analysis() { return fraud_analysis; }
    public void setFraud_analysis(FraudAnalysisOutput fraud_analysis) { this.fraud_analysis = fraud_analysis; }

    public ExplanationOutput getExplanation() { return explanation; }
    public void setExplanation(ExplanationOutput explanation) { this.explanation = explanation; }

    public String getFinal_status() { return final_status; }
    public void setFinal_status(String final_status) { this.final_status = final_status; }

    public boolean isOfficer_decision_required() { return officer_decision_required; }
    public void setOfficer_decision_required(boolean officer_decision_required) { this.officer_decision_required = officer_decision_required; }

    public static class ProfileOutput {
        private String citizen_id;
        private String age_group;
        private String income_category;
        private String occupation_category;
        private String land_category;
        private String family_category;
        private double vulnerability_score;
        private double document_readiness;
        private boolean aadhaar_verified;
        private boolean bank_account;
        private boolean farmer_indicator;
        private boolean senior_citizen_indicator;

        public ProfileOutput() {}

        // Getters and Setters
        public String getCitizen_id() { return citizen_id; }
        public void setCitizen_id(String citizen_id) { this.citizen_id = citizen_id; }

        public String getAge_group() { return age_group; }
        public void setAge_group(String age_group) { this.age_group = age_group; }

        public String getIncome_category() { return income_category; }
        public void setIncome_category(String income_category) { this.income_category = income_category; }

        public String getOccupation_category() { return occupation_category; }
        public void setOccupation_category(String occupation_category) { this.occupation_category = occupation_category; }

        public String getLand_category() { return land_category; }
        public void setLand_category(String land_category) { this.land_category = land_category; }

        public String getFamily_category() { return family_category; }
        public void setFamily_category(String family_category) { this.family_category = family_category; }

        public double getVulnerability_score() { return vulnerability_score; }
        public void setVulnerability_score(double vulnerability_score) { this.vulnerability_score = vulnerability_score; }

        public double getDocument_readiness() { return document_readiness; }
        public void setDocument_readiness(double document_readiness) { this.document_readiness = document_readiness; }

        public boolean isAadhaar_verified() { return aadhaar_verified; }
        public void setAadhaar_verified(boolean aadhaar_verified) { this.aadhaar_verified = aadhaar_verified; }

        public boolean isBank_account() { return bank_account; }
        public void setBank_account(boolean bank_account) { this.bank_account = bank_account; }

        public boolean isFarmer_indicator() { return farmer_indicator; }
        public void setFarmer_indicator(boolean farmer_indicator) { this.farmer_indicator = farmer_indicator; }

        public boolean isSenior_citizen_indicator() { return senior_citizen_indicator; }
        public void setSenior_citizen_indicator(boolean senior_citizen_indicator) { this.senior_citizen_indicator = senior_citizen_indicator; }
    }

    public static class RecommendationItem {
        private String scheme_id;
        private String scheme_name;
        private boolean eligible;
        private int score;
        private List<String> reasons;
        private List<String> missing_documents;

        public RecommendationItem() {}

        // Getters and Setters
        public String getScheme_id() { return scheme_id; }
        public void setScheme_id(String scheme_id) { this.scheme_id = scheme_id; }

        public String getScheme_name() { return scheme_name; }
        public void setScheme_name(String scheme_name) { this.scheme_name = scheme_name; }

        public boolean isEligible() { return eligible; }
        public void setEligible(boolean eligible) { this.eligible = eligible; }

        public int getScore() { return score; }
        public void setScore(int score) { this.score = score; }

        public List<String> getReasons() { return reasons; }
        public void setReasons(List<String> reasons) { this.reasons = reasons; }

        public List<String> getMissing_documents() { return missing_documents; }
        public void setMissing_documents(List<String> missing_documents) { this.missing_documents = missing_documents; }
    }

    public static class FraudAnalysisOutput {
        private String prediction;
        private double fraud_probability;
        private String risk_level;
        private String verification_requirement;

        public FraudAnalysisOutput() {}

        // Getters and Setters
        public String getPrediction() { return prediction; }
        public void setPrediction(String prediction) { this.prediction = prediction; }

        public double getFraud_probability() { return fraud_probability; }
        public void setFraud_probability(double fraud_probability) { this.fraud_probability = fraud_probability; }

        public String getRisk_level() { return risk_level; }
        public void setRisk_level(String risk_level) { this.risk_level = risk_level; }

        public String getVerification_requirement() { return verification_requirement; }
        public void setVerification_requirement(String verification_requirement) { this.verification_requirement = verification_requirement; }
    }

    public static class ExplanationOutput {
        private List<ShapFactorItem> top_factors;
        private String human_readable_explanation;

        public ExplanationOutput() {}

        // Getters and Setters
        public List<ShapFactorItem> getTop_factors() { return top_factors; }
        public void setTop_factors(List<ShapFactorItem> top_factors) { this.top_factors = top_factors; }

        public String getHuman_readable_explanation() { return human_readable_explanation; }
        public void setHuman_readable_explanation(String human_readable_explanation) { this.human_readable_explanation = human_readable_explanation; }
    }

    public static class ShapFactorItem {
        private String feature;
        private double observed_value;
        private double shap_value;
        private String impact;
        private String explanation;

        public ShapFactorItem() {}

        // Getters and Setters
        public String getFeature() { return feature; }
        public void setFeature(String feature) { this.feature = feature; }

        public double getObserved_value() { return observed_value; }
        public void setObserved_value(double observed_value) { this.observed_value = observed_value; }

        public double getShap_value() { return shap_value; }
        public void setShap_value(double shap_value) { this.shap_value = shap_value; }

        public String getImpact() { return impact; }
        public void setImpact(String impact) { this.impact = impact; }

        public String getExplanation() { return explanation; }
        public void setExplanation(String explanation) { this.explanation = explanation; }
    }
}
