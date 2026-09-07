"""
FastAPI AI Service Bridge
Unified Citizen Management System (UCMS) for Village Administration

Exposes the UCMS Python AI novelty pipeline via HTTP REST endpoints for consumption by backend/frontend apps.
"""

import sys
import os
import joblib
import pandas as pd
import numpy as np

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

# Ensure local src module imports work seamlessly regardless of working directory
src_dir = os.path.dirname(os.path.abspath(__file__))
if src_dir not in sys.path:
    sys.path.insert(0, src_dir)

from citizenProfileAnalyzer import CitizenProfileAnalyzer
from fraudEngine import FraudIntelligenceEngine
from recommendationEngine import RecommendationEngine
from explainableAI import ExplainableAILayer

# Initialize FastAPI Application
app = FastAPI(
    title="UCMS AI Service",
    description="AI service for Unified Citizen Management System",
    version="1.0.0"
)

# Configure CORS Middleware for Frontend/Backend Local Integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health_check():
    """
    Independent Health Check Endpoint.
    Returns status ok without invoking AI engines.
    """
    return {
        "status": "ok",
        "service": "UCMS AI Service"
    }


@app.post("/api/v1/analyze/{application_id}")
def analyze_application_endpoint(application_id: str):
    """
    Primary AI Analysis Endpoint.
    Loads target application and citizen records, executes full AI novelty pipeline,
    and returns structured JSON audit results.
    """
    data_dir = "data"
    models_dir = "models"

    # Paths to dataset files
    citizens_path = os.path.join(data_dir, "citizens.csv")
    apps_path = os.path.join(data_dir, "applications.csv")
    schemes_path = os.path.join(data_dir, "schemes.csv")

    if not (os.path.exists(citizens_path) and os.path.exists(apps_path) and os.path.exists(schemes_path)):
        raise HTTPException(
            status_code=500,
            detail={
                "success": False,
                "error": "AI pipeline processing failed",
                "details": f"Required dataset files missing in '{data_dir}' directory."
            }
        )

    try:
        citizens_df = pd.read_csv(citizens_path)
        apps_df = pd.read_csv(apps_path)
        schemes_df = pd.read_csv(schemes_path)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={
                "success": False,
                "error": "AI pipeline processing failed",
                "details": f"Failed to read synthetic CSV datasets: {str(e)}"
            }
        )

    # 1. Fetch requested application record
    matched_apps = apps_df[apps_df["application_id"] == application_id]
    if matched_apps.empty:
        raise HTTPException(
            status_code=404,
            detail={
                "success": False,
                "error": "Application not found",
                "application_id": application_id
            }
        )
    app_row = matched_apps.iloc[0]
    citizen_id = str(app_row["citizen_id"])

    # 2. Fetch corresponding citizen record
    matched_citizens = citizens_df[citizens_df["citizen_id"] == citizen_id]
    if matched_citizens.empty:
        raise HTTPException(
            status_code=404,
            detail={
                "success": False,
                "error": f"Citizen record '{citizen_id}' not found for application '{application_id}'",
                "application_id": application_id,
                "citizen_id": citizen_id
            }
        )
    citizen_row = matched_citizens.iloc[0]

    try:
        # 3. Step 1 — Citizen Profile Analyzer
        analyzer = CitizenProfileAnalyzer()
        enriched_profile = analyzer.analyze_profile(citizen_row)

        # 4. Step 2 — Rule-Based Fraud Intelligence
        fraud_engine = FraudIntelligenceEngine(citizens_filepath=citizens_path)
        rule_fraud_res = fraud_engine.analyze_application(app_row, citizen_row)

        # 5. Step 3 — ML Fraud Classifier
        model_path = os.path.join(models_dir, "fraud", "fraud_model.joblib")
        if not os.path.exists(model_path):
            model_path = os.path.join(models_dir, "fraud_model.joblib")

        ml_res = {"prediction": "UNKNOWN", "fraud_probability": 0.0, "fraud_probability_percent": "N/A"}
        shap_res = {"status": "unavailable", "reason": "Model file not found"}

        if os.path.exists(model_path):
            artifact = joblib.load(model_path)
            model = artifact["model"]
            feature_names = artifact["feature_names"]

            # Feature engineering matching train.py
            merged_record = {**citizen_row.to_dict(), **app_row.to_dict()}
            actual_income = float(merged_record.get("annual_income", 0))
            declared_income = float(merged_record.get("declared_income", 0))
            actual_land = float(merged_record.get("land_area", 0.0))
            declared_land = float(merged_record.get("declared_land_area", 0.0))

            merged_record["income_ratio_diff"] = abs(declared_income - actual_income) / (actual_income + 1e-5)
            merged_record["land_diff"] = abs(declared_land - actual_land)

            fv_list = [float(merged_record.get(fname, 0.0)) for fname in feature_names]
            feature_vector = np.array(fv_list).reshape(1, -1)
            fv_df = pd.DataFrame(feature_vector, columns=feature_names)

            pred_idx = int(model.predict(fv_df)[0])
            pred_label = "FRAUD" if pred_idx == 1 else "NORMAL"
            pred_prob = float(model.predict_proba(fv_df)[0][1])

            ml_res = {
                "prediction": pred_label,
                "fraud_probability": round(pred_prob, 4),
                "fraud_probability_percent": f"{pred_prob * 100:.1f}%"
            }

            # 6. Step 4 — SHAP Explainable AI
            try:
                xai = ExplainableAILayer()
                shap_eval = xai.explain_ml_fraud_prediction(model, fv_df, feature_names)
                if shap_eval.get("shap_available", False):
                    shap_res = shap_eval
                else:
                    shap_res = {"status": "unavailable", "reason": shap_eval.get("error", "SHAP calculation error")}
            except Exception as e_shap:
                shap_res = {"status": "unavailable", "reason": str(e_shap)}

        # 7. Step 5 — Dynamic Scheme Recommendation Engine
        rec_engine = RecommendationEngine(schemes_filepath=schemes_path)
        top_3_recs = rec_engine.recommend_schemes(enriched_profile, top_n=3)

        # 8. Return JSON Response
        return {
            "success": True,
            "application": {
                "application_id": str(app_row["application_id"]),
                "citizen_id": str(app_row["citizen_id"]),
                "scheme_id": str(app_row["scheme_id"]),
                "application_status": str(app_row.get("application_status", "Submitted")),
                "application_date": str(app_row.get("application_date", ""))
            },
            "citizen_profile": enriched_profile,
            "fraud_intelligence": rule_fraud_res,
            "ml_fraud_prediction": ml_res,
            "shap_explanation": shap_res,
            "scheme_recommendations": top_3_recs
        }

    except Exception as err:
        raise HTTPException(
            status_code=500,
            detail={
                "success": False,
                "error": "AI pipeline processing failed",
                "details": str(err)
            }
        )


from pydantic import BaseModel
from typing import List, Optional

class CitizenInfoSchema(BaseModel):
    citizen_id: str
    age: int
    gender: str
    annual_income: float
    occupation: str
    land_area: float
    family_size: Optional[int] = 4
    education_level: Optional[str] = "Primary"
    disability_status: Optional[bool] = False
    marital_status: Optional[str] = "Single"
    employment_status: Optional[str] = "Employed"
    village: str
    existing_scheme_count: Optional[int] = 0
    bank_account: Optional[bool] = True
    ration_card: Optional[str] = "PHH"
    aadhaar_verified: Optional[bool] = True
    housing_condition: Optional[str] = "Pucca"
    health_condition: Optional[str] = "Good"
    farmer_status: Optional[bool] = False
    senior_citizen: Optional[bool] = False
    previous_benefit_received: Optional[bool] = False

class ApplicationInfoSchema(BaseModel):
    application_id: str
    citizen_id: str
    scheme_id: str
    declared_income: float
    declared_land_area: float
    document_count: Optional[int] = 1
    application_date: str

class AiAnalysisRequestSchema(BaseModel):
    citizen: CitizenInfoSchema
    application: ApplicationInfoSchema


@app.post("/api/v1/ai/analyze")
def analyze_live_application(payload: AiAnalysisRequestSchema):
    """
    Integrates directly with Spring Boot. Receives citizen and application parameters
    dynamically in the POST body, analyzes eligibility, vulnerability, and ML fraud probability,
    and returns a structured JSON audit with SHAP explanations.
    """
    models_dir = "models"
    schemes_path = os.path.join("data", "schemes.csv")

    try:
        # 1. Transform request payload to dictionaries expected by engines
        citizen_dict = payload.citizen.dict()
        app_dict = payload.application.dict()
        
        # 2. Step 1 — Citizen Profile Analyzer
        analyzer = CitizenProfileAnalyzer()
        enriched_profile = analyzer.analyze_profile(citizen_dict)

        # 3. Step 2 — Rule-Based Fraud Intelligence
        fraud_engine = FraudIntelligenceEngine()
        rule_fraud_res = fraud_engine.analyze_application(app_dict, citizen_dict)

        # 4. Step 3 — ML Fraud Classifier (Random Forest)
        model_path = os.path.join(models_dir, "fraud_model.joblib")
        if not os.path.exists(model_path):
            model_path = os.path.join(models_dir, "fraud", "fraud_model.joblib")

        ml_res = {"prediction": "UNKNOWN", "fraud_probability": 0.0, "fraud_probability_percent": "N/A"}
        shap_res = {"status": "unavailable", "reason": "Model file not found"}

        if os.path.exists(model_path):
            artifact = joblib.load(model_path)
            model = artifact["model"]
            feature_names = artifact["feature_names"]

            # Prepare feature vector
            X_df = fraud_engine.prepare_single_app_features(app_dict, citizen_dict)

            pred_idx = int(model.predict(X_df)[0])
            pred_label = "FRAUD" if pred_idx == 1 else "NORMAL"
            pred_prob = float(model.predict_proba(X_df)[0][1])

            ml_res = {
                "prediction": pred_label,
                "fraud_probability": round(pred_prob, 4),
                "fraud_probability_percent": f"{pred_prob * 100:.1f}%"
            }

            # 5. Step 4 — SHAP Explainable AI
            try:
                xai = ExplainableAILayer()
                shap_eval = xai.explain_ml_fraud_prediction(model, X_df, feature_names)
                if shap_eval.get("shap_available", False):
                    shap_res = shap_eval
                else:
                    shap_res = {"status": "unavailable", "reason": shap_eval.get("error", "SHAP calculation error")}
            except Exception as e_shap:
                shap_res = {"status": "unavailable", "reason": str(e_shap)}

        # 6. Step 5 — Dynamic Scheme Recommendation Engine
        rec_engine = RecommendationEngine(schemes_filepath=schemes_path)
        top_3_recs = rec_engine.recommend_schemes(enriched_profile, top_n=3)

        # 7. Map recommendations to match RecommendationItem Java DTO
        mapped_recs = []
        for r in top_3_recs:
            mapped_recs.append({
                "scheme_id": r.get("scheme_id"),
                "scheme_name": r.get("scheme_name"),
                "eligible": r.get("eligible"),
                "score": int(r.get("score")),
                "reasons": r.get("reasons"),
                "missing_documents": r.get("missing_documents")
            })

        # 8. Map SHAP explanation to ExplanationOutput Java DTO
        top_factors = []
        if shap_res.get("shap_available", False):
            for factor in shap_res.get("top_shap_factors", []):
                top_factors.append({
                    "feature": factor.get("feature"),
                    "observed_value": float(factor.get("observed_value")),
                    "shap_value": float(factor.get("shap_value")),
                    "impact": factor.get("impact"),
                    "explanation": factor.get("explanation")
                })
        
        human_explanation = shap_res.get("human_readable_explanation", "")
        if not human_explanation:
            human_explanation = f"The model assigned a {rule_fraud_res.get('risk_level', 'LOW').lower()} fraud probability of {ml_res.get('fraud_probability', 0.0)*100:.1f}%. The verification recommendation is {rule_fraud_res.get('verification_requirement')}."

        explanation_output = {
            "top_factors": top_factors,
            "human_readable_explanation": human_explanation
        }

        # 9. Return mapped JSON response matching com.ucms.dto.AiAnalysisResponse
        return {
            "citizen_id": payload.citizen.citizen_id,
            "application_id": payload.application.application_id,
            "profile": {
                "citizen_id": enriched_profile.get("citizen_id"),
                "age_group": enriched_profile.get("age_group"),
                "income_category": enriched_profile.get("income_category"),
                "occupation_category": enriched_profile.get("occupation_category"),
                "land_category": enriched_profile.get("land_category"),
                "family_category": enriched_profile.get("family_category"),
                "vulnerability_score": float(enriched_profile.get("vulnerability_score", 0.0)),
                "document_readiness": float(enriched_profile.get("document_readiness", 0.0)),
                "aadhaar_verified": bool(enriched_profile.get("aadhaar_verified", False)),
                "bank_account": bool(enriched_profile.get("bank_account", False)),
                "farmer_indicator": bool(enriched_profile.get("farmer_indicator", False)),
                "senior_citizen_indicator": bool(enriched_profile.get("senior_citizen_indicator", False))
            },
            "recommendations": mapped_recs,
            "fraud_analysis": {
                "prediction": ml_res.get("prediction"),
                "fraud_probability": ml_res.get("fraud_probability"),
                "risk_level": rule_fraud_res.get("risk_level"),
                "verification_requirement": rule_fraud_res.get("verification_requirement")
            },
            "explanation": explanation_output,
            "final_status": "PENDING OFFICER REVIEW",
            "officer_decision_required": True
        }

    except Exception as err:
        raise HTTPException(
            status_code=500,
            detail={
                "success": False,
                "error": "AI live pipeline processing failed",
                "details": str(err)
            }
        )
