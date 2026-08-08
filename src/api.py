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
