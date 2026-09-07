"""
UCMS Unified AI Pipeline Orchestrator
Unified Citizen Management System (UCMS) for Village Administration

Integrates existing AI/novelty components into a single end-to-end execution flow:
 1. Citizen Profile Analyzer
 2. Rule-Based Fraud Intelligence Engine
 3. Machine Learning Fraud Classifier
 4. Explainable AI / Local SHAP Feature Attribution Layer
 5. Dynamic Scheme Recommendation Engine
"""

import sys
import os
import joblib
import pandas as pd
import numpy as np

from citizenProfileAnalyzer import CitizenProfileAnalyzer
from fraudEngine import FraudIntelligenceEngine
from recommendationEngine import RecommendationEngine
from explainableAI import ExplainableAILayer

def run_unified_ai_pipeline(app_id="APP10001", data_dir="data", models_dir="models"):
    """
    Orchestrates the end-to-end AI workflow across all 4 novelty components for a selected application.
    """
    # -------------------------------------------------------------------------
    # STEP 1 — LOAD DATA & SELECT TARGET RECORD
    # -------------------------------------------------------------------------
    citizens_path = os.path.join(data_dir, "citizens.csv")
    apps_path = os.path.join(data_dir, "applications.csv")
    schemes_path = os.path.join(data_dir, "schemes.csv")

    if not (os.path.exists(citizens_path) and os.path.exists(apps_path) and os.path.exists(schemes_path)):
        raise FileNotFoundError(f"Required dataset files missing in '{data_dir}'. Ensure datasets exist.")

    citizens_df = pd.read_csv(citizens_path)
    apps_df = pd.read_csv(apps_path)
    schemes_df = pd.read_csv(schemes_path)

    # Select application
    matched_apps = apps_df[apps_df["application_id"] == app_id]
    if matched_apps.empty:
        app_row = apps_df.iloc[0]
        app_id = app_row["application_id"]
    else:
        app_row = matched_apps.iloc[0]

    citizen_id = app_row["citizen_id"]
    scheme_id = app_row["scheme_id"]

    # Match corresponding citizen
    matched_citizens = citizens_df[citizens_df["citizen_id"] == citizen_id]
    if matched_citizens.empty:
        raise ValueError(f"Citizen ID '{citizen_id}' from application '{app_id}' not found in citizen database.")
    
    citizen_row = matched_citizens.iloc[0]

    # -------------------------------------------------------------------------
    # STEP 2 — CITIZEN PROFILE ANALYZER
    # -------------------------------------------------------------------------
    profile_analyzer = CitizenProfileAnalyzer()
    enriched_profile = profile_analyzer.analyze_profile(citizen_row)

    # -------------------------------------------------------------------------
    # STEP 3 — RULE-BASED FRAUD INTELLIGENCE ENGINE
    # -------------------------------------------------------------------------
    fraud_engine = FraudIntelligenceEngine(citizens_filepath=citizens_path)
    rule_fraud_res = fraud_engine.analyze_application(app_row, citizen_row)

    # -------------------------------------------------------------------------
    # STEP 4 — ML FRAUD MODEL
    # -------------------------------------------------------------------------
    # Support both model paths (models/fraud/fraud_model.joblib or models/fraud_model.joblib)
    model_path = os.path.join(models_dir, "fraud", "fraud_model.joblib")
    if not os.path.exists(model_path):
        model_path = os.path.join(models_dir, "fraud_model.joblib")

    ml_fraud_res = {}
    shap_res = {}
    model_loaded = False

    if os.path.exists(model_path):
        try:
            artifact = joblib.load(model_path)
            model = artifact["model"]
            feature_names = artifact["feature_names"]
            model_loaded = True

            # Construct feature vector using exact same feature engineering as train.py
            merged_record = {**citizen_row.to_dict(), **app_row.to_dict()}
            actual_income = float(merged_record.get("annual_income", 0))
            declared_income = float(merged_record.get("declared_income", 0))
            actual_land = float(merged_record.get("land_area", 0.0))
            declared_land = float(merged_record.get("declared_land_area", 0.0))

            merged_record["income_ratio_diff"] = abs(declared_income - actual_income) / (actual_income + 1e-5)
            merged_record["land_diff"] = abs(declared_land - actual_land)

            fv_list = []
            for fname in feature_names:
                if fname in merged_record:
                    fv_list.append(float(merged_record[fname]))
                else:
                    fv_list.append(0.0)

            feature_vector = np.array(fv_list).reshape(1, -1)

            if feature_vector.shape[1] != len(feature_names):
                raise ValueError(f"Feature vector length mismatch. Expected: {len(feature_names)}, Received: {feature_vector.shape[1]}")

            fv_df = pd.DataFrame(feature_vector, columns=feature_names)
            pred_idx = int(model.predict(fv_df)[0])
            pred_label = "FRAUD" if pred_idx == 1 else "NORMAL"
            pred_prob = float(model.predict_proba(fv_df)[0][1])

            ml_fraud_res = {
                "prediction": pred_label,
                "fraud_probability": round(pred_prob, 4),
                "fraud_probability_percent": f"{pred_prob * 100:.1f}%"
            }

            # -------------------------------------------------------------------------
            # STEP 5 — SHAP EXPLANATION
            # -------------------------------------------------------------------------
            xai = ExplainableAILayer()
            shap_res = xai.explain_ml_fraud_prediction(model, fv_df, feature_names)

        except Exception as e:
            print(f"ML / SHAP Pipeline Warning: {str(e)}")
            ml_fraud_res = {"error": str(e), "prediction": "UNKNOWN", "fraud_probability_percent": "N/A"}
            shap_res = {"shap_available": False, "error": str(e)}
    else:
        print(f"Notice: Model artifact not found at '{model_path}'. Skipped ML/SHAP evaluation.")
        ml_fraud_res = {"prediction": "MODEL_NOT_FOUND", "fraud_probability_percent": "N/A"}
        shap_res = {"shap_available": False, "error": "Model file not found"}

    # -------------------------------------------------------------------------
    # STEP 6 — DYNAMIC SCHEME RECOMMENDATION ENGINE
    # -------------------------------------------------------------------------
    rec_engine = RecommendationEngine(schemes_filepath=schemes_path)
    top_3_recs = rec_engine.recommend_schemes(enriched_profile, top_n=3)

    # -------------------------------------------------------------------------
    # STEP 7 — UNIFIED RESULT DICTIONARY
    # -------------------------------------------------------------------------
    unified_result = {
        "application": app_row.to_dict(),
        "citizen_profile": enriched_profile,
        "fraud_rule_assessment": rule_fraud_res,
        "ml_fraud_assessment": ml_fraud_res,
        "shap_explanation": shap_res,
        "scheme_recommendations": top_3_recs
    }

    # -------------------------------------------------------------------------
    # FINAL CONSOLE REPORT FORMATTING
    # -------------------------------------------------------------------------
    print("\n============================================================")
    print("              UCMS UNIFIED AI ASSESSMENT                    ")
    print("============================================================")

    print("\nAPPLICATION")
    print("-----------")
    print(f"Application ID : {app_id}")
    print(f"Citizen ID     : {citizen_id}")
    print(f"Scheme ID      : {scheme_id}")

    print("\n------------------------------------------------------------")
    print("CITIZEN PROFILE")
    print("------------------------------------------------------------")
    print(f"Age Category       : {enriched_profile['age_group']}")
    print(f"Income Category    : {enriched_profile['income_category']}")
    print(f"Occupation Category: {enriched_profile['occupation_category']}")
    print(f"Land Category      : {enriched_profile['land_category']}")
    print(f"Vulnerability      : {enriched_profile['vulnerability_score']}/100")
    print(f"Document Readiness : {enriched_profile['document_readiness']}%")

    print("\n------------------------------------------------------------")
    print("FRAUD INTELLIGENCE")
    print("------------------------------------------------------------")
    risk_score_val = rule_fraud_res.get('risk_score', round(rule_fraud_res.get('fraud_probability', 0.0) * 100, 1))
    print(f"Rule-Based Risk Score : {risk_score_val}/100")
    print(f"Risk Level            : {rule_fraud_res.get('risk_level', 'LOW')}")

    print("\nDetected Indicators:")
    if rule_fraud_res.get("indicators"):
        for ind in rule_fraud_res["indicators"]:
            print(f"- {ind}")
    else:
        print("- None (Clean Application)")

    print("\n------------------------------------------------------------")
    print("ML FRAUD PREDICTION")
    print("------------------------------------------------------------")
    print(f"Prediction        : {ml_fraud_res.get('prediction', 'N/A')}")
    print(f"Fraud Probability : {ml_fraud_res.get('fraud_probability_percent', 'N/A')}")

    print("\n------------------------------------------------------------")
    print("SHAP EXPLANATION")
    print("------------------------------------------------------------")
    if shap_res.get("shap_available", False):
        print("Top Contributing Factors:\n")
        for idx, factor in enumerate(shap_res.get("top_shap_factors", []), 1):
            print(f"{idx}.")
            print(f"   Feature    : {factor['feature']}")
            print(f"   Value      : {factor['observed_value']}")
            print(f"   SHAP       : {factor['shap_value']}")
            print(f"   Impact     : {factor['impact']}")
            print(f"   Explanation: {factor['explanation']}\n")
    else:
        print(f"SHAP Status: UNAVAILABLE ({shap_res.get('error', 'N/A')})")

    print("------------------------------------------------------------")
    print("SCHEME RECOMMENDATIONS")
    print("------------------------------------------------------------")
    for idx, rec in enumerate(top_3_recs, 1):
        print(f"\n{idx}. Scheme: [{rec['scheme_id']}] {rec['scheme_name']}")
        print(f"   Eligibility: {'ELIGIBLE' if rec['eligible'] else 'INELIGIBLE'}")
        print(f"   Score      : {rec['score']}/100")
        if rec.get("reasons"):
            print("   Main Reasons:")
            for r in rec["reasons"][:2]: # Show top 2 reasons for brevity
                print(f"     + {r}")
        if rec.get("missing_documents"):
            print(f"   Missing Documents: {', '.join(rec['missing_documents'])}")

    print("\n============================================================")
    print("UNIFIED AI ASSESSMENT COMPLETE                             ")
    print("============================================================")

    return unified_result

if __name__ == "__main__":
    target_app = sys.argv[1] if len(sys.argv) > 1 else "APP10001"
    run_unified_ai_pipeline(app_id=target_app)
