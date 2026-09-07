"""
AI Pipeline Evaluation Module
Unified Citizen Management System (UCMS) for Village Administration

Evaluates:
 1. Machine Learning Fraud Classifier performance (Accuracy, Precision, Recall, F1, Confusion Matrix)
 2. Scheme Recommendation Engine accuracy against synthetic ground truth criteria
Note: All reported evaluation metrics are derived from synthetic benchmark data.
"""

import os
import joblib
import pandas as pd
import numpy as np
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score, precision_score, recall_score, f1_score
from train import prepare_features
from recommendationEngine import RecommendationEngine
from citizenProfileAnalyzer import CitizenProfileAnalyzer

def evaluate_fraud_ml_model(data_dir=None, models_dir=None):
    """
    Evaluates the ML baseline fraud model on synthetic test datasets.
    """
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    if data_dir is None:
        data_dir = os.path.join(base_dir, "data")
    if models_dir is None:
        models_dir = os.path.join(base_dir, "models")

    print("\n==========================================================================")
    print("           STEP 1: FRAUD MACHINE LEARNING MODEL EVALUATION                ")
    print("==========================================================================")

    model_path = os.path.join(models_dir, "fraud_model.joblib")
    if not os.path.exists(model_path):
        model_path = os.path.join(models_dir, "fraud", "fraud_model.joblib")

    if not os.path.exists(model_path):
        print(f"Notice: Trained model file not found at {model_path}. Auto-training model...")
        try:
            from train import train_fraud_ml_model
            train_fraud_ml_model(data_dir=data_dir, models_dir=models_dir)
            model_path = os.path.join(models_dir, "fraud_model.joblib")
        except Exception as e:
            print(f"Error auto-training model: {e}")
            return None

    artifact = joblib.load(model_path)
    model = artifact["model"]
    feature_names = artifact["feature_names"]

    apps_csv = os.path.join(data_dir, "applications.csv")
    citizens_csv = os.path.join(data_dir, "citizens.csv")

    apps_df = pd.read_csv(apps_csv)
    citizens_df = pd.read_csv(citizens_csv)

    X, y, _ = prepare_features(apps_df, citizens_df)

    y_pred = model.predict(X)

    acc = accuracy_score(y, y_pred)
    prec = precision_score(y, y_pred, zero_division=0)
    rec = recall_score(y, y_pred, zero_division=0)
    f1 = f1_score(y, y_pred, zero_division=0)
    cm = confusion_matrix(y, y_pred)

    print("\n[ML Fraud Model Metrics - Synthetic Benchmark Data]")
    print(f"Accuracy  : {acc * 100:.2f}%")
    print(f"Precision : {prec * 100:.2f}%")
    print(f"Recall    : {rec * 100:.2f}%")
    print(f"F1-Score  : {f1 * 100:.2f}%")

    print("\nConfusion Matrix:")
    print(f"  True Negatives  (Normal classified as Normal) : {cm[0][0]}")
    print(f"  False Positives (Normal classified as Fraud)  : {cm[0][1]}")
    print(f"  False Negatives (Fraud classified as Normal)  : {cm[1][0]}")
    print(f"  True Positives  (Fraud classified as Fraud)   : {cm[1][1]}")

    print("\nDetailed Classification Report:")
    print(classification_report(y, y_pred, target_names=["Normal (0)", "Fraud (1)"]))

    return {
        "accuracy": acc,
        "precision": prec,
        "recall": rec,
        "f1_score": f1,
        "confusion_matrix": cm
    }

def evaluate_recommendation_engine(data_dir=None, n_samples=100):
    """
    Evaluates rule-based scheme recommendation consistency against ground-truth eligibility criteria.
    """
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    if data_dir is None:
        data_dir = os.path.join(base_dir, "data")

    print("\n==========================================================================")
    print("      STEP 2: DYNAMIC RECOMMENDATION ENGINE CONSISTENCY EVALUATION        ")
    print("==========================================================================")

    citizens_path = os.path.join(data_dir, "citizens.csv")
    schemes_path = os.path.join(data_dir, "schemes.csv")

    citizens_df = pd.read_csv(citizens_path)
    schemes_df = pd.read_csv(schemes_path)

    analyzer = CitizenProfileAnalyzer()
    rec_engine = RecommendationEngine(schemes_filepath=schemes_path)

    sample_citizens = citizens_df.head(n_samples)
    total_evaluations = 0
    correct_eligibility_matches = 0

    for _, c_row in sample_citizens.iterrows():
        profile = analyzer.analyze_profile(c_row)
        for _, s_row in schemes_df.iterrows():
            total_evaluations += 1
            eval_res = rec_engine.evaluate_eligibility_and_score(profile, s_row)

            # Verification of hard eligibility rule logic
            age = profile["raw_age"]
            inc = profile["raw_income"]
            land = profile["raw_land_area"]
            occ = str(profile.get("raw_occupation", "")).lower()

            min_age = s_row["minimum_age"]
            max_age = s_row["maximum_age"]
            max_inc = s_row["maximum_income"]
            min_land = s_row.get("minimum_land_area", 0.0)
            max_land = s_row.get("maximum_land_area", 999.0)
            req_occ = str(s_row.get("required_occupation", "Any")).lower()

            expected_eligible = (min_age <= age <= max_age) and (inc <= max_inc) and (min_land <= land <= max_land)

            if req_occ != "any":
                expected_eligible = expected_eligible and (req_occ in occ or (req_occ == "farmer" and profile.get("farmer_indicator", False)))

            if s_row.get("requires_farmer", False):
                expected_eligible = expected_eligible and profile.get("farmer_indicator", False)

            if s_row.get("requires_disability", False):
                dis_flag = bool(c_row["disability_status"]) if "disability_status" in c_row and pd.notna(c_row["disability_status"]) else bool(profile.get("disability_status", False))
                expected_eligible = expected_eligible and dis_flag

            if eval_res["eligible"] == bool(expected_eligible):
                correct_eligibility_matches += 1

    rec_accuracy = (correct_eligibility_matches / total_evaluations) * 100.0
    print(f"Evaluated {total_evaluations} citizen-scheme pairings across {n_samples} synthetic profiles.")
    print(f"Ground-Truth Deterministic Rule Verification Accuracy: {rec_accuracy:.2f}%")

    print("\n* DISCLAIMER: All evaluation results are computed strictly using synthetic demo data *")

if __name__ == "__main__":
    evaluate_fraud_ml_model()
    evaluate_recommendation_engine()

