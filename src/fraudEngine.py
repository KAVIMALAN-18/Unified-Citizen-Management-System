"""
Fraud Intelligence Engine Module
Unified Citizen Management System (UCMS) for Village Administration

Analyzes application records using a trained Random Forest model to predict fraud probability,
risk classification level, and verification requirements.
"""

import os
import joblib
import pandas as pd
import numpy as np

def safe_float(val, default=0.0):
    if val is None or pd.isna(val):
        return default
    try:
        return float(val)
    except (ValueError, TypeError):
        return default

class FraudIntelligenceEngine:
    """
    ML-based Fraud Risk Detection and Intelligence Analysis Engine.
    """
    # Configurable Thresholds for Risk Classification
    RISK_THRESHOLD_LOW = 0.30
    RISK_THRESHOLD_MEDIUM = 0.70

    # Mapped Verification Requirements
    VERIFICATION_LOW = "Standard Verification"
    VERIFICATION_MEDIUM = "Additional Document Verification"
    VERIFICATION_HIGH = "Enhanced Manual Verification"

    def __init__(self, citizens_filepath=None, models_dir=None):
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        if citizens_filepath is None:
            citizens_filepath = os.path.join(base_dir, "data", "citizens.csv")
        if models_dir is None:
            models_dir = os.path.join(base_dir, "models")

        # Load citizen database for reference/lookup
        try:
            citizens_df = pd.read_csv(citizens_filepath)
            self.citizen_lookup = citizens_df.set_index("citizen_id").to_dict("index")
        except Exception:
            self.citizen_lookup = {}

        # Load applications database to track historical metrics for custom applications
        try:
            apps_path = os.path.join(os.path.dirname(citizens_filepath), "applications.csv")
            self.applications_df = pd.read_csv(apps_path)
        except Exception:
            self.applications_df = pd.DataFrame()

        # Load pre-trained model
        model_paths = [
            os.path.join(models_dir, "fraud_model.joblib"),
            os.path.join(models_dir, "fraud", "fraud_model.joblib"),
            "models/fraud_model.joblib",
            "models/fraud/fraud_model.joblib"
        ]
        
        self.model = None
        self.feature_names = [
            "income_deviation_pct", "land_deviation_pct", "application_frequency",
            "days_since_previous_application", "scheme_claim_count", "benefit_overlap_count",
            "document_completeness", "citizen_data_consistency", "application_consistency_score",
            "declared_income", "declared_land_area", "annual_income", "land_area",
            "document_count", "family_size", "existing_scheme_count", "income_ratio_diff",
            "land_diff"
        ]

        for mp in model_paths:
            if os.path.exists(mp):
                try:
                    artifact = joblib.load(mp)
                    self.model = artifact["model"]
                    self.feature_names = artifact["feature_names"]
                    break
                except Exception as e:
                    print(f"Warning: Could not load fraud ML model artifact from '{mp}': {e}")

    def prepare_single_app_features(self, application, citizen_profile):
        """
        Assembles and aligns a single row DataFrame matching the training feature space.
        """
        app = application.to_dict() if isinstance(application, pd.Series) else dict(application)
        profile = citizen_profile.to_dict() if isinstance(citizen_profile, pd.Series) else dict(citizen_profile)

        cid = app.get("citizen_id", profile.get("citizen_id", "UNKNOWN"))

        # Base attributes
        declared_income = safe_float(app.get("declared_income", 0))
        declared_land_area = safe_float(app.get("declared_land_area", 0.0))
        document_count = safe_float(app.get("document_count", 0))

        annual_income = safe_float(profile.get("annual_income", profile.get("raw_income", 0)))
        land_area = safe_float(profile.get("land_area", profile.get("raw_land_area", 0.0)))
        family_size = safe_float(profile.get("family_size", 1))
        existing_scheme_count = safe_float(profile.get("existing_scheme_count", 0))

        # 1. income_deviation_pct
        if "income_deviation_pct" in app and app["income_deviation_pct"] is not None:
            income_deviation_pct = safe_float(app["income_deviation_pct"])
        else:
            income_deviation_pct = round(abs(declared_income - annual_income) / max(annual_income, 1.0) * 100.0, 2)

        # 2. land_deviation_pct
        if "land_deviation_pct" in app and app["land_deviation_pct"] is not None:
            land_deviation_pct = safe_float(app["land_deviation_pct"])
        else:
            if land_area > 0:
                land_deviation_pct = round(abs(declared_land_area - land_area) / land_area * 100.0, 2)
            else:
                land_deviation_pct = round(declared_land_area * 100.0, 2) if declared_land_area > 0 else 0.0

        # History extraction for frequency/overlap if applications_df is present
        c_apps = pd.DataFrame()
        if not self.applications_df.empty:
            c_apps = self.applications_df[self.applications_df["citizen_id"] == cid].copy()
            if not c_apps.empty and "application_date" in c_apps.columns:
                c_apps["application_date"] = pd.to_datetime(c_apps["application_date"])
                c_apps = c_apps.sort_values(by="application_date")

        # 3. application_frequency
        if "application_frequency" in app and app["application_frequency"] is not None:
            application_frequency = safe_float(app["application_frequency"])
        else:
            application_frequency = safe_float(len(c_apps) + 1 if not c_apps.empty else 1.0)

        # 4. days_since_previous_application
        if "days_since_previous_application" in app and app["days_since_previous_application"] is not None:
            days_since_previous_application = safe_float(app["days_since_previous_application"])
        else:
            if not c_apps.empty:
                app_date = pd.to_datetime(app.get("application_date", pd.Timestamp.now()))
                last_app_date = c_apps.iloc[-1]["application_date"]
                days_since_previous_application = safe_float(max(0, (app_date - last_app_date).days))
            else:
                days_since_previous_application = -1.0

        # 5. scheme_claim_count
        if "scheme_claim_count" in app and app["scheme_claim_count"] is not None:
            scheme_claim_count = safe_float(app["scheme_claim_count"])
        else:
            if not c_apps.empty:
                applied_schemes = set(c_apps["scheme_id"].unique())
                applied_schemes.add(app.get("scheme_id", "SCH000"))
                scheme_claim_count = safe_float(len(applied_schemes))
            else:
                scheme_claim_count = 1.0

        # 6. benefit_overlap_count
        if "benefit_overlap_count" in app and app["benefit_overlap_count"] is not None:
            benefit_overlap_count = safe_float(app["benefit_overlap_count"])
        else:
            benefit_overlap_count = safe_float(len(c_apps["scheme_id"].unique()) if not c_apps.empty else 0.0)

        # 7. document_completeness
        if "document_completeness" in app and app["document_completeness"] is not None:
            document_completeness = safe_float(app["document_completeness"])
        else:
            document_completeness = round(min(1.0, document_count / 4.0), 2)


        # 8. citizen_data_consistency
        if "citizen_data_consistency" in app:
            citizen_data_consistency = float(app["citizen_data_consistency"])
        else:
            c_cons = 100.0 - min(45.0, income_deviation_pct * 0.45) - min(45.0, land_deviation_pct * 0.45)
            citizen_data_consistency = round(max(0.0, min(100.0, c_cons)), 2)

        # 9. application_consistency_score
        if "application_consistency_score" in app:
            application_consistency_score = float(app["application_consistency_score"])
        else:
            a_cons = (document_completeness * 60.0)
            if 0 <= days_since_previous_application <= 3:
                a_cons += 10.0
            elif days_since_previous_application > 3 or days_since_previous_application == -1:
                a_cons += 40.0
            application_consistency_score = round(max(0.0, min(100.0, a_cons)), 2)

        # 10. income_ratio_diff
        income_ratio_diff = abs(declared_income - annual_income) / (annual_income + 1e-5)

        # 11. land_diff
        land_diff = abs(declared_land_area - land_area)

        feature_dict = {
            "income_deviation_pct": income_deviation_pct,
            "land_deviation_pct": land_deviation_pct,
            "application_frequency": application_frequency,
            "days_since_previous_application": days_since_previous_application,
            "scheme_claim_count": scheme_claim_count,
            "benefit_overlap_count": benefit_overlap_count,
            "document_completeness": document_completeness,
            "citizen_data_consistency": citizen_data_consistency,
            "application_consistency_score": application_consistency_score,
            "declared_income": declared_income,
            "declared_land_area": declared_land_area,
            "annual_income": annual_income,
            "land_area": land_area,
            "document_count": document_count,
            "family_size": family_size,
            "existing_scheme_count": existing_scheme_count,
            "income_ratio_diff": income_ratio_diff,
            "land_diff": land_diff
        }

        # Align with feature_names columns
        df = pd.DataFrame([feature_dict])
        df = df[self.feature_names]
        return df

    def analyze_application(self, application, citizen_profile=None):
        """
        Analyzes a single application using the loaded ML Random Forest model.
        """
        if isinstance(application, pd.Series):
            app = application.to_dict()
        else:
            app = application

        app_id = app.get("application_id", "UNKNOWN_APP")
        cid = app.get("citizen_id", "UNKNOWN_CIT")

        # Fetch underlying citizen record if not passed directly
        if citizen_profile is None:
            c_profile = self.citizen_lookup.get(cid, {})
        elif isinstance(citizen_profile, pd.Series):
            c_profile = citizen_profile.to_dict()
        else:
            c_profile = citizen_profile

        # Prepare features
        X_df = self.prepare_single_app_features(app, c_profile)

        # ML Inference
        if self.model is not None:
            pred_class_val = self.model.predict(X_df)[0]
            prediction_label = "FRAUD" if pred_class_val == 1 else "NORMAL"
            
            # Determine fraud index from model classes
            fraud_idx = 1
            if hasattr(self.model, "classes_"):
                classes = list(self.model.classes_)
                if 1 in classes:
                    fraud_idx = classes.index(1)
            
            prob_arr = self.model.predict_proba(X_df)[0]
            fraud_probability = float(prob_arr[fraud_idx])
        else:
            # Fallback if model not loaded
            fraud_probability = 0.0
            prediction_label = "NORMAL"

        # Validate probability range
        if fraud_probability is None or np.isnan(fraud_probability) or fraud_probability < 0.0 or fraud_probability > 1.0:
            raise ValueError(f"Invalid fraud probability computed: {fraud_probability}")

        # Map to Risk Level using configurable thresholds
        if fraud_probability <= self.RISK_THRESHOLD_LOW:
            risk_level = "LOW"
            verification_requirement = self.VERIFICATION_LOW
            explanation_text = "The application shows standard characteristics consistent with a low-risk profile."
        elif fraud_probability <= self.RISK_THRESHOLD_MEDIUM:
            risk_level = "MEDIUM"
            verification_requirement = self.VERIFICATION_MEDIUM
            explanation_text = "The model detected anomalies requiring additional document verification."
        else:
            risk_level = "HIGH"
            verification_requirement = self.VERIFICATION_HIGH
            explanation_text = "Critical pattern matches detected by the ML classifier. Immediate enhanced field audit required."

        # Aggregate key indicators for explainability support (e.g. deviations)
        indicators = []
        inc_dev = X_df.loc[0, "income_deviation_pct"]
        land_dev = X_df.loc[0, "land_deviation_pct"]
        doc_completeness = X_df.loc[0, "document_completeness"]

        if inc_dev > 30.0:
            indicators.append("Significant Income Mismatch Anomaly")
        if land_dev > 35.0:
            indicators.append("Revenue Land Mismatch Anomaly")
        if doc_completeness < 0.6:
            indicators.append("Document Completeness Deficiency")

        # Compile result dictionary
        return {
            "application_id": app_id,
            "citizen_id": cid,
            "risk_level": risk_level,
            "verification_requirement": verification_requirement,
            "prediction": prediction_label,
            "fraud_probability": round(fraud_probability, 4),
            "indicators": indicators,
            "explanation": [explanation_text],
            "feature_vector": X_df
        }

    def analyze_dataset(self, applications_df):
        """
        Processes a dataset of applications and appends fraud scores and risk categories.
        """
        results = []
        for _, row in applications_df.iterrows():
            cid = row["citizen_id"]
            c_profile = self.citizen_lookup.get(cid, {})
            res = self.analyze_application(row, c_profile)
            results.append(res)
        return pd.DataFrame(results)

if __name__ == "__main__":
    # Test execution
    sample_app = {
        "application_id": "APP10045",
        "citizen_id": "CIT10001",
        "declared_income": 20000,
        "declared_land_area": 5.5,
        "document_count": 1
    }

    sample_citizen = {
        "citizen_id": "CIT10001",
        "annual_income": 85000,
        "land_area": 0.5,
        "family_size": 4,
        "existing_scheme_count": 1
    }

    engine = FraudIntelligenceEngine()
    analysis = engine.analyze_application(sample_app, sample_citizen)

    print("\nML Fraud Engine Analysis Result:")
    print(f"Application ID : {analysis['application_id']}")
    print(f"Prediction     : {analysis['prediction']}")
    print(f"Probability    : {analysis['fraud_probability']:.4f}")
    print(f"Risk Level     : {analysis['risk_level']}")
    print(f"Verification   : {analysis['verification_requirement']}")
