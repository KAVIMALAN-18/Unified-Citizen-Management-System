"""
Main Pipeline Execution Entrypoint
Unified Citizen Management System (UCMS) for Village Administration

Executes the end-to-end AI workflow across the four core novelty components:
 1. Citizen Profile Analyzer
 2. Dynamic Scheme Recommendation Engine
 3. Fraud Intelligence Engine
 4. Explainable AI (XAI) Layer
"""

import sys
import os
import pandas as pd
import numpy as np

from citizenProfileAnalyzer import CitizenProfileAnalyzer
from recommendationEngine import RecommendationEngine
from fraudEngine import FraudIntelligenceEngine
from explainableAI import ExplainableAILayer

def run_pipeline(citizen_id=None, app_id=None, data_dir="data"):
    """
    Runs full AI pipeline for a specified citizen and application record.
    """
    print("\n==========================================================================")
    print(" UNIFIED CITIZEN MANAGEMENT SYSTEM (UCMS) - AI NOVELTY MODULE PIPELINE ")
    print("==========================================================================")

    citizens_path = os.path.join(data_dir, "citizens.csv")
    schemes_path = os.path.join(data_dir, "schemes.csv")
    apps_path = os.path.join(data_dir, "applications.csv")

    if not (os.path.exists(citizens_path) and os.path.exists(schemes_path) and os.path.exists(apps_path)):
        print(f"Dataset files missing in {data_dir}. Generating synthetic datasets now...")
        from generate_data import generate_synthetic_datasets
        generate_synthetic_datasets(data_dir=data_dir)

    citizens_df = pd.read_csv(citizens_path)
    schemes_df = pd.read_csv(schemes_path)
    apps_df = pd.read_csv(apps_path)

    # 1. SELECT SAMPLE CITIZEN & APPLICATION RECORD
    if citizen_id is None:
        # Pick a citizen with an application
        sample_app_row = apps_df.iloc[0]
        citizen_id = sample_app_row["citizen_id"]
        app_id = sample_app_row["application_id"]
    else:
        matched_apps = apps_df[apps_df["citizen_id"] == citizen_id]
        if not matched_apps.empty:
            app_id = matched_apps.iloc[0]["application_id"]
        else:
            app_id = apps_df.iloc[0]["application_id"]

    citizen_row = citizens_df[citizens_df["citizen_id"] == citizen_id].iloc[0]
    app_row = apps_df[apps_df["application_id"] == app_id].iloc[0]

    print(f"\n[INPUT TARGET RECORD]")
    print(f"Target Citizen ID     : {citizen_id} ({citizen_row['age']} yrs, {citizen_row['gender']}, Village: {citizen_row['village']})")
    print(f"Target Application ID : {app_id} (Scheme: {app_row['scheme_id']}, Status: {app_row['application_status']})")

    # -------------------------------------------------------------------------
    # NOVELTY COMPONENT 1: CITIZEN PROFILE ANALYZER
    # -------------------------------------------------------------------------
    print("\n--------------------------------------------------------------------------")
    print(" [COMPONENT 1/4] CITIZEN PROFILE ANALYZER                                ")
    print("--------------------------------------------------------------------------")
    analyzer = CitizenProfileAnalyzer()
    enriched_profile = analyzer.analyze_profile(citizen_row)
    print(f"Age Category        : {enriched_profile['age_group']}")
    print(f"Income Category     : {enriched_profile['income_category']}")
    print(f"Occupation Category : {enriched_profile['occupation_category']}")
    print(f"Land Category       : {enriched_profile['land_category']}")
    print(f"Vulnerability Score : {enriched_profile['vulnerability_score']}/100")
    print(f"Document Readiness  : {enriched_profile['document_readiness']}%")

    # -------------------------------------------------------------------------
    # NOVELTY COMPONENT 2: DYNAMIC SCHEME RECOMMENDATION ENGINE
    # -------------------------------------------------------------------------
    print("\n--------------------------------------------------------------------------")
    print(" [COMPONENT 2/4] DYNAMIC SCHEME RECOMMENDATION ENGINE                   ")
    print("--------------------------------------------------------------------------")
    rec_engine = RecommendationEngine(schemes_filepath=schemes_path)
    recommendations = rec_engine.recommend_schemes(enriched_profile, top_n=3)
    top_recommendation = recommendations[0]

    print(f"Top Recommended Scheme : [{top_recommendation['scheme_id']}] {top_recommendation['scheme_name']}")
    print(f"Eligibility Match      : {top_recommendation['eligible']}")
    print(f"Recommendation Score   : {top_recommendation['score']}/100")

    # -------------------------------------------------------------------------
    # NOVELTY COMPONENT 3: FRAUD INTELLIGENCE ENGINE
    # -------------------------------------------------------------------------
    print("\n--------------------------------------------------------------------------")
    print(" [COMPONENT 3/4] FRAUD INTELLIGENCE ENGINE                              ")
    print("--------------------------------------------------------------------------")
    fraud_engine = FraudIntelligenceEngine(citizens_filepath=citizens_path)
    fraud_assessment = fraud_engine.analyze_application(app_row, citizen_row)

    print(f"Application ID     : {fraud_assessment['application_id']}")
    print(f"Risk Level Category: {fraud_assessment['risk_level']}")
    print(f"Verification Req.  : {fraud_assessment['verification_requirement']}")
    print(f"Fraud Probability  : {fraud_assessment['fraud_probability']:.4f} ({fraud_assessment['fraud_probability']*100:.1f}%)")

    # -------------------------------------------------------------------------
    # NOVELTY COMPONENT 4: EXPLAINABLE AI LAYER (XAI)
    # -------------------------------------------------------------------------
    print("\n--------------------------------------------------------------------------")
    print(" [COMPONENT 4/4] EXPLAINABLE AI LAYER (XAI)                             ")
    print("--------------------------------------------------------------------------")
    xai = ExplainableAILayer()
    rec_explanation = xai.explain_recommendation(top_recommendation, enriched_profile)
    fraud_explanation = xai.explain_fraud_assessment(fraud_assessment, app_row, model=fraud_engine.model, feature_names=fraud_engine.feature_names)

    report_text = xai.format_console_output(rec_explanation, fraud_explanation)
    print(report_text)

    # -------------------------------------------------------------------------
    # FINAL UCMS AI AUDIT REPORT
    # -------------------------------------------------------------------------
    print("\n--------------------------------------------")
    print("UCMS AI AUDIT REPORT")
    print("--------------------------------------------")
    print(f"Citizen ID:\n{citizen_id}")
    print(f"\nCitizen Profile:")
    print(f"  Age: {enriched_profile['raw_age']} ({enriched_profile['age_group']})")
    print(f"  Income: INR {enriched_profile['raw_income']:,} ({enriched_profile['income_category']})")
    print(f"  Occupation: {enriched_profile['raw_occupation']}")
    print(f"  Land Area: {enriched_profile['raw_land_area']} acres ({enriched_profile['land_category']})")
    print(f"  Vulnerability Score: {enriched_profile['vulnerability_score']}/100")
    print(f"  Document Readiness: {enriched_profile['document_readiness']}%")
    
    print(f"\nRecommended Schemes:")
    for idx, rec in enumerate(recommendations, 1):
        status = "Eligible" if rec['eligible'] else "Ineligible"
        print(f"  {idx}. [{rec['scheme_id']}] {rec['scheme_name']} - Score: {rec['score']}/100 ({status})")
        if rec['missing_documents']:
            print(f"     Missing: {', '.join(rec['missing_documents'])}")
            
    print(f"\nApplication:")
    print(f"  Application ID: {app_row['application_id']}")
    print(f"  Applied Scheme: {app_row['scheme_id']}")
    print(f"  Declared Income: INR {app_row['declared_income']:,}")
    print(f"  Declared Land Area: {app_row['declared_land_area']} acres")
    print(f"  Uploaded Document Count: {app_row['document_count']}")
    
    print(f"\nFraud Prediction:\n{fraud_assessment['prediction']}")
    print(f"\nFraud Probability:\n{fraud_assessment['fraud_probability'] * 100:.2f}%")
    print(f"\nRisk Level:\n{fraud_assessment['risk_level']}")
    
    # Map verification requirements to clean matching upper case
    v_req_upper = fraud_assessment['verification_requirement'].upper()
    print(f"\nVerification Requirement:\n{v_req_upper}")
    
    print(f"\nSHAP Factors:")
    if fraud_explanation.get("shap_available", False):
        for idx, f in enumerate(fraud_explanation["top_shap_factors"], 1):
            sign = "+" if f['shap_value'] >= 0 else ""
            print(f"  - {f['feature']} (Observed: {f['observed_value']:.2f}, SHAP: {sign}{f['shap_value']:.4f})")
    else:
        print("  - SHAP factors not calculated.")
        
    print(f"\nAI Explanation:\n{fraud_explanation['human_readable_explanation']}")
    print("\nFinal Status:\nPENDING OFFICER REVIEW")
    print("--------------------------------------------")
    print("\nDisclaimer:")
    print("The AI system provides decision support only. The fraud-risk")
    print("prediction and verification recommendation do not constitute")
    print("an automatic approval or rejection. The final decision remains")
    print("with the authorized officer.")
    print("--------------------------------------------")

    print("\n[SUCCESS] AI pipeline completed end-to-end execution.")

if __name__ == "__main__":
    cid = sys.argv[1] if len(sys.argv) > 1 else None
    run_pipeline(citizen_id=cid)
