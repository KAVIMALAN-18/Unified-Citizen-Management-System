import sys
import os
import pandas as pd
import numpy as np

# Add workspace src to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../src")))

from citizenProfileAnalyzer import CitizenProfileAnalyzer
from recommendationEngine import RecommendationEngine
from fraudEngine import FraudIntelligenceEngine
from explainableAI import ExplainableAILayer

class AIService:
    def __init__(self):
        self.analyzer = CitizenProfileAnalyzer()
        # Initialize recommendation engine using schemes.csv path
        schemes_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../data/schemes.csv"))
        self.rec_engine = RecommendationEngine(schemes_filepath=schemes_path)
        
        # Initialize fraud engine
        citizens_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../data/citizens.csv"))
        models_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../models"))
        self.fraud_engine = FraudIntelligenceEngine(citizens_filepath=citizens_path, models_dir=models_dir)
        
        # Initialize explainable AI layer
        self.xai = ExplainableAILayer()

    def analyze(self, citizen_data: dict, app_data: dict) -> dict:
        """
        Coordinates profile enrichment, scheme matching, fraud ML prediction, and SHAP calculation.
        """
        # 1. Citizen Profile Analyzer
        enriched = self.analyzer.analyze_profile(citizen_data)
        
        # 2. Scheme Recommendation Engine
        recommendations = self.rec_engine.recommend_schemes(enriched, top_n=3)
        
        # 3. Fraud ML Prediction Engine
        fraud_result = self.fraud_engine.analyze_application(app_data, citizen_data)
        
        # 4. Explainable AI & SHAP Explanation
        # Call explain_fraud_assessment to get the full formatted explanation + SHAP factors
        fraud_explanation = self.xai.explain_fraud_assessment(
            fraud_result, 
            app_data, 
            model=self.fraud_engine.model, 
            feature_names=self.fraud_engine.feature_names
        )

        # Structure response fields exactly as expected by Pydantic response schema
        profile_out = {
            "citizen_id": enriched.get("citizen_id", "UNKNOWN"),
            "age_group": enriched.get("age_group", ""),
            "income_category": enriched.get("income_category", ""),
            "occupation_category": enriched.get("occupation_category", ""),
            "land_category": enriched.get("land_category", ""),
            "family_category": enriched.get("family_category", ""),
            "vulnerability_score": enriched.get("vulnerability_score", 0.0),
            "document_readiness": enriched.get("document_readiness", 0.0),
            "aadhaar_verified": enriched.get("aadhaar_verified", False),
            "bank_account": enriched.get("bank_account", False),
            "farmer_indicator": enriched.get("farmer_indicator", False),
            "senior_citizen_indicator": enriched.get("senior_citizen_indicator", False)
        }

        recs_out = []
        for rec in recommendations:
            recs_out.append({
                "scheme_id": rec.get("scheme_id", ""),
                "scheme_name": rec.get("scheme_name", ""),
                "eligible": rec.get("eligible", False),
                "score": rec.get("score", 0),
                "reasons": rec.get("reasons", []),
                "missing_documents": rec.get("missing_documents", [])
            })

        fraud_out = {
            "prediction": fraud_result.get("prediction", "NORMAL"),
            "fraud_probability": fraud_result.get("fraud_probability", 0.0),
            "risk_level": fraud_result.get("risk_level", "LOW"),
            "verification_requirement": fraud_result.get("verification_requirement", "Standard Verification")
        }

        # Map SHAP factors format safely
        shap_factors = []
        for f in fraud_explanation.get("top_shap_factors", []):
            shap_factors.append({
                "feature": f.get("feature", ""),
                "observed_value": float(f.get("observed_value", 0.0)),
                "shap_value": float(f.get("shap_value", 0.0)),
                "impact": f.get("impact", ""),
                "explanation": f.get("explanation", "")
            })

        explanation_out = {
            "top_factors": shap_factors,
            "human_readable_explanation": fraud_explanation.get("human_readable_explanation", "")
        }

        return {
            "citizen_id": citizen_data.get("citizen_id", "UNKNOWN"),
            "application_id": app_data.get("application_id", "UNKNOWN"),
            "profile": profile_out,
            "recommendations": recs_out,
            "fraud_analysis": fraud_out,
            "explanation": explanation_out,
            "final_status": "PENDING OFFICER REVIEW",
            "officer_decision_required": True
        }
