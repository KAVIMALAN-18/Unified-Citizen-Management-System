"""
Explainable AI Layer (XAI) Module
Unified Citizen Management System (UCMS) for Village Administration

Translates complex analytical outputs from Recommendation, Fraud Engines, and Machine Learning models
into transparent, human-interpretable explanations for village administrators.
Provides local SHAP-based feature attributions for ML predictions.
"""

import os
import numpy as np
import pandas as pd
import shap

class ExplainableAILayer:
    """
    Generates structured, feature-backed explanations for AI recommendations,
    fraud risk assessments, and local SHAP feature attributions for ML predictions.
    """
    def __init__(self):
        pass

    def explain_recommendation(self, recommendation_result, citizen_profile):
        """
        Generates human-understandable explanation for a scheme recommendation result.
        """
        scheme_name = recommendation_result.get("scheme_name", "Government Scheme")
        score = recommendation_result.get("score", 0)
        eligible = recommendation_result.get("eligible", False)
        reasons = recommendation_result.get("reasons", [])
        missing_docs = recommendation_result.get("missing_documents", [])

        explanation = {
            "summary_title": f"Scheme Recommendation: {scheme_name}",
            "decision": "ELIGIBLE" if eligible else "INELIGIBLE",
            "confidence_score": f"{score}%",
            "key_driving_factors": reasons,
            "actionable_requirements": []
        }

        if missing_docs:
            explanation["actionable_requirements"].append(
                f"Action Required: Upload missing document(s) -> {', '.join(missing_docs)}"
            )
        else:
            explanation["actionable_requirements"].append("All required documents are ready for submission.")

        return explanation

    def explain_fraud_assessment(self, fraud_result, application_data, model=None, feature_names=None):
        """
        Generates structured audit trail explanation for a fraud intelligence evaluation,
        integrating local SHAP attributions if a model and feature names are provided.
        """
        app_id = fraud_result.get("application_id", "Unknown")
        risk_level = fraud_result.get("risk_level", "LOW")
        verification_requirement = fraud_result.get("verification_requirement", "Standard Verification")
        fraud_prob = fraud_result.get("fraud_probability", 0.0)
        indicators = fraud_result.get("indicators", [])

        # Get SHAP explanation if model and feature_names are provided
        shap_factors = []
        human_explanation = ""
        shap_available = False

        if model is not None and feature_names is not None and "feature_vector" in fraud_result:
            X_df = fraud_result["feature_vector"]
            shap_res = self.explain_ml_fraud_prediction(model, X_df, feature_names)
            if shap_res.get("shap_available", False):
                shap_factors = shap_res.get("top_shap_factors", [])
                shap_available = True
                
                # Build human-readable explanation based on actual SHAP factors
                if shap_factors:
                    contributing_features = []
                    reducing_features = []
                    for f in shap_factors:
                        if f["shap_value"] > 0:
                            contributing_features.append(f["feature"])
                        else:
                            reducing_features.append(f["feature"])
                    
                    explanation_sentences = []
                    if contributing_features:
                        explanation_sentences.append(f"The strongest factors contributing toward a higher fraud prediction were: {', '.join(contributing_features)}.")
                    if reducing_features:
                        explanation_sentences.append(f"Features indicating a lower fraud risk included: {', '.join(reducing_features)}.")
                    
                    human_explanation = " ".join(explanation_sentences)
                else:
                    human_explanation = "No significant features contributed to the fraud prediction."

        if not human_explanation:
            human_explanation = f"The model assigned a {risk_level.lower()} fraud probability of {fraud_prob*100:.1f}%. The verification recommendation is {verification_requirement}."

        explanation = {
            "summary_title": f"Fraud Intelligence Audit for Application #{app_id}",
            "risk_assessment": f"{risk_level} RISK (Probability: {fraud_prob:.4f})",
            "risk_level": risk_level,
            "fraud_probability": fraud_prob,
            "verification_requirement": verification_requirement,
            "flagged_indicators": indicators if indicators else ["None (Clean Application)"],
            "feature_level_explanations": fraud_result.get("explanation", []),
            "top_shap_factors": shap_factors,
            "human_readable_explanation": human_explanation,
            "shap_available": shap_available,
            "administrative_recommendation": f"{verification_requirement} - Review required."
        }

        return explanation

    def generate_shap_plot(self, feature_names, shap_values_vector, save_path="models/shap_feature_contributions.png"):
        """
        Generates a matplotlib horizontal bar chart showing top 5 absolute SHAP feature contributions.
        """
        try:
            import matplotlib.pyplot as plt

            abs_vals = np.abs(shap_values_vector)
            top_idx = np.argsort(abs_vals)[::-1][:5]
  
            top_names = [feature_names[i] for i in top_idx][::-1]
            top_vals = [float(shap_values_vector[i]) for i in top_idx][::-1]

            plt.figure(figsize=(8, 4))
            plt.barh(top_names, top_vals)
            plt.axvline(0, color="gray", linestyle="--", linewidth=0.8)
            plt.xlabel("SHAP Value (Impact on Fraud Probability)")
            plt.ylabel("Feature")
            plt.title("Local SHAP Feature Contributions")
            plt.tight_layout()

            os.makedirs(os.path.dirname(save_path), exist_ok=True)
            plt.savefig(save_path)
            plt.close()
            return True
        except Exception as e:
            print(f"Warning: Could not generate SHAP plot: {str(e)}")
            return False

    def explain_ml_fraud_prediction(self, model, feature_vector, feature_names):
        """
        Computes local SHAP feature attributions for a single ML fraud prediction using TreeExplainer.
        Handles multiple input types (Series, DataFrame, 1D/2D arrays, lists) and SHAP output formats.
        """
        try:
            # Safely prepare feature vector as 2D numpy array and DataFrame with feature names
            if isinstance(feature_vector, pd.DataFrame):
                X_df = feature_vector[feature_names]
                X = X_df.values
            elif isinstance(feature_vector, pd.Series):
                X_df = pd.DataFrame([feature_vector[feature_names]])
                X = X_df.values
            elif isinstance(feature_vector, (list, np.ndarray)):
                arr = np.array(feature_vector)
                X = arr.reshape(1, -1) if arr.ndim == 1 else arr
                X_df = pd.DataFrame(X, columns=feature_names)
            else:
                X = np.array(feature_vector).reshape(1, -1)
                X_df = pd.DataFrame(X, columns=feature_names)

            if X.shape[1] != len(feature_names):
                raise ValueError(f"Feature vector size ({X.shape[1]}) does not match feature_names length ({len(feature_names)})")

            # 1. Compute prediction & probabilities
            pred_class_idx = int(model.predict(X_df)[0])
            prediction_label = "FRAUD" if pred_class_idx == 1 else "NORMAL"
            fraud_prob = float(model.predict_proba(X_df)[0][1])

            # 2. TreeExplainer Initialization & Execution
            explainer = shap.TreeExplainer(model)

            # Determine Base Value float
            base_val = 0.5
            if hasattr(explainer, "expected_value") and explainer.expected_value is not None:
                ev = explainer.expected_value
                if isinstance(ev, (list, np.ndarray)):
                    ev_flat = np.array(ev).flatten()
                    base_val = float(ev_flat[1]) if len(ev_flat) > 1 else float(ev_flat[0])
                else:
                    base_val = float(ev)

            # Compute SHAP Values
            shap_vals_vec = None
            try:
                exp_obj = explainer(X)
                if hasattr(exp_obj, "base_values") and exp_obj.base_values is not None:
                    bv = exp_obj.base_values
                    if isinstance(bv, (list, np.ndarray)):
                        bv_flat = np.array(bv).flatten()
                        base_val = float(bv_flat[1]) if len(bv_flat) > 1 else float(bv_flat[0])
                    else:
                        base_val = float(bv)

                if hasattr(exp_obj, "values") and exp_obj.values is not None:
                    vals = np.array(exp_obj.values)
                    if vals.ndim == 3: # (1, N, 2)
                        shap_vals_vec = vals[0, :, 1]
                    elif vals.ndim == 2:
                        if vals.shape[0] == 1:
                            shap_vals_vec = vals[0, :]
                        else:
                            shap_vals_vec = vals[:, 1]
                    elif vals.ndim == 1:
                        shap_vals_vec = vals
            except Exception:
                pass

            if shap_vals_vec is None:
                sv = explainer.shap_values(X)
                if isinstance(sv, list):
                    vals = sv[1] if len(sv) > 1 else sv[0]
                    shap_vals_vec = vals[0] if vals.ndim == 2 else vals
                elif isinstance(sv, np.ndarray):
                    if sv.ndim == 3:
                        shap_vals_vec = sv[0, :, 1]
                    elif sv.ndim == 2:
                        shap_vals_vec = sv[0, :]
                    else:
                        shap_vals_vec = sv

            if shap_vals_vec is None:
                raise ValueError("Unable to extract SHAP attribution values.")

            shap_vals_vec = np.array(shap_vals_vec).flatten()

            # 3. Sort features by absolute SHAP contribution
            abs_shap = np.abs(shap_vals_vec)
            sorted_indices = np.argsort(abs_shap)[::-1]

            top_shap_factors = []
            for idx in sorted_indices[:5]:
                fname = feature_names[idx]
                obs_val = float(X[0, idx])
                s_val = float(shap_vals_vec[idx])
                impact = "INCREASES_FRAUD_RISK" if s_val >= 0 else "DECREASES_FRAUD_RISK"

                if s_val >= 0:
                    exp_text = f"{fname} contributed toward a higher fraud prediction."
                else:
                    exp_text = f"{fname} contributed toward a lower fraud prediction."

                top_shap_factors.append({
                    "feature": fname,
                    "observed_value": round(obs_val, 4),
                    "shap_value": round(s_val, 4),
                    "impact": impact,
                    "explanation": exp_text
                })

            # Generate Visualization Plot
            plot_saved = self.generate_shap_plot(feature_names, shap_vals_vec, "models/shap_feature_contributions.png")

            return {
                "prediction": prediction_label,
                "fraud_probability": round(fraud_prob, 4),
                "fraud_probability_percent": f"{fraud_prob * 100:.1f}%",
                "base_value": round(base_val, 4) if base_val is not None else None,
                "top_shap_factors": top_shap_factors,
                "visualization_path": "models/shap_feature_contributions.png" if plot_saved else None,
                "shap_available": True
            }

        except Exception as e:
            return {
                "error": f"SHAP calculation error: {str(e)}",
                "shap_available": False
            }

    def explain_ml_fraud_model(self, model, feature_vector, feature_names, shap_explainer=None):
        """
        Provides ML-specific feature importance explanation using global feature importances and local SHAP.
        Maintains backward compatibility across all input types (Series, DataFrame, 1D/2D arrays, lists).
        """
        explanation = {}
        try:
            # Safely format feature_vector into 2D DataFrame and 2D array
            if isinstance(feature_vector, pd.DataFrame):
                X_df = feature_vector[feature_names]
                X_arr = X_df.values
            elif isinstance(feature_vector, pd.Series):
                X_df = pd.DataFrame([feature_vector[feature_names]])
                X_arr = X_df.values
            elif isinstance(feature_vector, (list, np.ndarray)):
                arr = np.array(feature_vector)
                X_arr = arr.reshape(1, -1) if arr.ndim == 1 else arr
                X_df = pd.DataFrame(X_arr, columns=feature_names)
            else:
                X_arr = np.array(feature_vector).reshape(1, -1)
                X_df = pd.DataFrame(X_arr, columns=feature_names)

            if hasattr(model, "predict_proba"):
                prob = model.predict_proba(X_df)[0][1]
                explanation["ml_fraud_probability"] = f"{prob * 100:.1f}%"

            if hasattr(model, "feature_importances_"):
                importances = model.feature_importances_
                top_idx = np.argsort(importances)[::-1]
                top_features = []
                for idx in top_idx[:5]:
                    if importances[idx] > 0.001:
                        val = float(X_arr[0, idx])
                        top_features.append({
                            "feature": feature_names[idx],
                            "importance_weight": round(float(importances[idx]), 4),
                            "observed_value": round(val, 4)
                        })
                explanation["top_predictive_features"] = top_features

            # Execute SHAP explanation
            shap_res = self.explain_ml_fraud_prediction(model, X_df, feature_names)
            if shap_res.get("shap_available", False):
                explanation["shap_values_summary"] = "SHAP feature attribution computed successfully."
                explanation["top_shap_factors"] = shap_res.get("top_shap_factors", [])

        except Exception as e:
            explanation["error"] = f"Unable to generate ML explanation: {str(e)}"

        return explanation

    def format_console_output(self, rec_exp, fraud_exp):
        """
        Formats explanations into clean console text.
        """
        lines = []
        lines.append("==========================================================================")
        lines.append("                     EXPLAINABLE AI (XAI) REPORT                          ")
        lines.append("==========================================================================")
        lines.append(f"\n[RECOMMENDATION EXPLANATION]")
        lines.append(f"Target Scheme : {rec_exp['summary_title']}")
        lines.append(f"Decision      : {rec_exp['decision']} (Suitability Score: {rec_exp['confidence_score']})")
        lines.append("Key Influencing Factors:")
        for factor in rec_exp['key_driving_factors']:
            lines.append(f"  + {factor}")
        lines.append("Next Action:")
        for act in rec_exp['actionable_requirements']:
            lines.append(f"  -> {act}")

        lines.append(f"\n[ML FRAUD AUDIT EXPLANATION]")
        lines.append(f"Report        : {fraud_exp['summary_title']}")
        lines.append(f"Probability   : {fraud_exp['fraud_probability']:.4f} ({fraud_exp['fraud_probability']*100:.1f}%)")
        lines.append(f"Risk Level    : {fraud_exp['risk_level']}")
        lines.append(f"Verification  : {fraud_exp['verification_requirement']}")
        
        if fraud_exp.get("shap_available", False):
            lines.append("\nTop SHAP Factors:")
            for idx, factor in enumerate(fraud_exp["top_shap_factors"], 1):
                sign = "+" if factor['shap_value'] >= 0 else ""
                lines.append(f"  {idx}. {factor['feature']}")
                lines.append(f"     Observed Value: {factor['observed_value']:.4f}")
                lines.append(f"     SHAP Value    : {sign}{factor['shap_value']:.4f}")
            lines.append(f"\nHuman-readable Explanation:")
            lines.append(f"  {fraud_exp['human_readable_explanation']}")
        else:
            lines.append("Flagged Indicators:")
            for ind in fraud_exp['flagged_indicators']:
                lines.append(f"  ! {ind}")
            lines.append("Detailed Feature Evidence:")
            for exp in fraud_exp['feature_level_explanations']:
                lines.append(f"  - {exp}")
                
        lines.append(f"\nAdmin Action  : {fraud_exp['administrative_recommendation']}")
        lines.append("==========================================================================")
        return "\n".join(lines)

if __name__ == "__main__":
    import joblib
    from recommendationEngine import RecommendationEngine
    from fraudEngine import FraudIntelligenceEngine
    from citizenProfileAnalyzer import CitizenProfileAnalyzer

    # 1. Existing Rule-based Demonstration
    sample_citizen = {
        "citizen_id": "CIT10001",
        "age": 63,
        "annual_income": 45000,
        "occupation": "Farmer",
        "land_area": 1.5,
        "family_size": 4,
        "disability_status": False,
        "housing_condition": "Kutcha",
        "ration_card": "AAY",
        "aadhaar_verified": True,
        "bank_account": True,
        "farmer_status": True,
        "existing_scheme_count": 0
    }

    sample_app = {
        "application_id": "APP10045",
        "citizen_id": "CIT10001",
        "declared_income": 20000,
        "declared_land_area": 5.5,
        "document_count": 1,
        "duplicate_identity_flag": 1,
        "income_mismatch_flag": 1,
        "land_mismatch_flag": 1,
        "multiple_scheme_flag": 0
    }

    profile = CitizenProfileAnalyzer().analyze_profile(sample_citizen)
    rec_result = RecommendationEngine().recommend_schemes(profile, top_n=1)[0]
    fraud_result = FraudIntelligenceEngine().analyze_application(sample_app, sample_citizen)

    xai = ExplainableAILayer()
    rec_exp = xai.explain_recommendation(rec_result, profile)
    fraud_exp = xai.explain_fraud_assessment(fraud_result, sample_app)

    print(xai.format_console_output(rec_exp, fraud_exp))

    # 2. Machine Learning SHAP Demonstration
    model_path = "models/fraud_model.joblib"
    if not os.path.exists(model_path):
        model_path = "models/fraud/fraud_model.joblib"

    if os.path.exists(model_path):
        try:
            artifact = joblib.load(model_path)
            model = artifact["model"]
            feature_names = artifact["feature_names"]

            print("\n==================================================")
            print("ML EXPLAINABLE AI")
            print("==================================================")

            apps_df = pd.read_csv("data/applications.csv")
            citizens_df = pd.read_csv("data/citizens.csv")
            merged = apps_df.merge(citizens_df, on="citizen_id", how="left")
            merged["income_ratio_diff"] = np.abs(merged["declared_income"] - merged["annual_income"]) / (merged["annual_income"] + 1e-5)
            merged["land_diff"] = np.abs(merged["declared_land_area"] - merged["land_area"])

            # Pick a sample application row
            sample_row = merged[feature_names].iloc[0]

            ml_exp = xai.explain_ml_fraud_prediction(model, sample_row, feature_names)

            if ml_exp.get("shap_available", False):
                print(f"Prediction       : {ml_exp['prediction']}")
                print(f"Fraud Probability: {ml_exp['fraud_probability_percent']}")
                print(f"Base Value       : {ml_exp['base_value']}")
                print("\nTop SHAP Factors:")
                for idx, factor in enumerate(ml_exp["top_shap_factors"], 1):
                    print(f"\n{idx}. {factor['feature']}")
                    print(f"   Observed Value : {factor['observed_value']}")
                    print(f"   SHAP Value     : {factor['shap_value']}")
                    print(f"   Impact         : {factor['impact']}")
                    print(f"   Explanation    : {factor['explanation']}")

                print("\nSHAP explanation generated successfully.")
            else:
                print(f"SHAP Evaluation Error: {ml_exp.get('error', 'Unknown Error')}")

        except Exception as e:
            print(f"Error loading ML model for demonstration: {str(e)}")
    else:
        print(f"\n[Notice] Trained model artifact not found at '{model_path}'. Run src/train.py first.")
