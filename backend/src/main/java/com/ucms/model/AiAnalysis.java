package com.ucms.model;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "ai_analyses")
public class AiAnalysis {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "application_id", nullable = false, unique = true)
    private Application application;

    @Column(name = "prediction", nullable = false)
    private String prediction;

    @Column(name = "fraud_probability", nullable = false)
    private Double fraudProbability;

    @Column(name = "fraud_risk_level", nullable = false)
    private String fraudRiskLevel;

    @Column(name = "verification_requirement", nullable = false)
    private String verificationRequirement;

    @Column(name = "shap_explanation", columnDefinition = "TEXT")
    private String shapExplanation;

    @Enumerated(EnumType.STRING)
    @Column(name = "ai_analysis_status", nullable = false)
    private AiAnalysisStatus aiAnalysisStatus = AiAnalysisStatus.ANALYZED;

    @CreationTimestamp
    @Column(name = "analyzed_at", nullable = false, updatable = false)
    private LocalDateTime analyzedAt;

    public AiAnalysis() {
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Application getApplication() { return application; }
    public void setApplication(Application application) { this.application = application; }

    public String getPrediction() { return prediction; }
    public void setPrediction(String prediction) { this.prediction = prediction; }

    public Double getFraudProbability() { return fraudProbability; }
    public void setFraudProbability(Double fraudProbability) { this.fraudProbability = fraudProbability; }

    public String getFraudRiskLevel() { return fraudRiskLevel; }
    public void setFraudRiskLevel(String fraudRiskLevel) { this.fraudRiskLevel = fraudRiskLevel; }

    public String getVerificationRequirement() { return verificationRequirement; }
    public void setVerificationRequirement(String verificationRequirement) { this.verificationRequirement = verificationRequirement; }

    public String getShapExplanation() { return shapExplanation; }
    public void setShapExplanation(String shapExplanation) { this.shapExplanation = shapExplanation; }

    public AiAnalysisStatus getAiAnalysisStatus() { return aiAnalysisStatus; }
    public void setAiAnalysisStatus(AiAnalysisStatus aiAnalysisStatus) { this.aiAnalysisStatus = aiAnalysisStatus; }

    public LocalDateTime getAnalyzedAt() { return analyzedAt; }
    public void setAnalyzedAt(LocalDateTime analyzedAt) { this.analyzedAt = analyzedAt; }
}
