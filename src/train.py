"""
Machine Learning Model Training Module — Baseline Fraud Classifier
Unified Citizen Management System (UCMS) for Village Administration

Trains a baseline interpretable Machine Learning classifier (DecisionTreeClassifier)
on synthetic scheme application data to predict synthetic fraud ground-truth labels.
Implements group-aware citizen-level splits (GroupShuffleSplit) to prevent citizen leakage
and trains exclusively on underlying observable behavioral and demographic features.

Excludes:
 - fraud_label (Target)
 - suspicious_pattern_score (Engineered aggregate score)
 - direct rule flags (duplicate_identity_flag, income_mismatch_flag, land_mismatch_flag, multiple_scheme_flag)
 - identifiers (citizen_id, application_id, scheme_id)

Disclaimer: Baseline ML fraud classifier trained and evaluated on synthetic UCMS application data.
Results do not represent real-world government fraud detection performance or patent claims.
"""

import os
import json
import joblib
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns

from sklearn.model_selection import GroupShuffleSplit
from sklearn.tree import DecisionTreeClassifier
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    roc_curve,
    confusion_matrix,
    classification_report
)

def prepare_features(apps_df, citizens_df):
    """
    Merges application data with citizen records and extracts primary ML features.
    Excludes direct target flags, aggregate scores, and identifiers to prevent leakage.
    """
    merged_df = apps_df.merge(citizens_df, on="citizen_id", how="left")

    # Feature Engineering
    merged_df["income_ratio_diff"] = np.abs(merged_df["declared_income"] - merged_df["annual_income"]) / (merged_df["annual_income"] + 1e-5)
    merged_df["land_diff"] = np.abs(merged_df["declared_land_area"] - merged_df["land_area"])

    feature_cols = [
        "income_deviation_pct",
        "land_deviation_pct",
        "application_frequency",
        "days_since_previous_application",
        "scheme_claim_count",
        "benefit_overlap_count",
        "document_completeness",
        "citizen_data_consistency",
        "application_consistency_score",
        "declared_income",
        "declared_land_area",
        "annual_income",
        "land_area",
        "document_count",
        "family_size",
        "existing_scheme_count",
        "income_ratio_diff",
        "land_diff"
    ]

    # Fill missing values safely
    X = merged_df[feature_cols].fillna(0).astype(float)
    y = merged_df["fraud_label"].astype(int)

    return X, y, feature_cols

def validate_anti_leakage(feature_names, train_citizens, test_citizens):
    """
    Performs 7 strict validation checks prior to model training.
    """
    prohibited = [
        "fraud_label",
        "suspicious_pattern_score",
        "duplicate_identity_flag",
        "income_mismatch_flag",
        "land_mismatch_flag",
        "multiple_scheme_flag",
        "citizen_id",
        "application_id",
        "scheme_id"
    ]

    # 1-6. Check prohibited features
    for col in feature_names:
        if col in prohibited:
            raise ValueError(f"Anti-Leakage Validation Error: Prohibited feature '{col}' detected in feature set!")

    # 7. Check citizen train/test overlap
    overlap = set(train_citizens).intersection(set(test_citizens))
    if len(overlap) > 0:
        raise ValueError(f"Anti-Leakage Validation Error: Train/Test citizen overlap is not zero! Overlap size: {len(overlap)}")

    return True

def train_fraud_model(data_dir="data", models_dir="models", random_state=42):
    """
    Trains and evaluates the baseline DecisionTreeClassifier fraud model using group-aware splitting.
    """
    os.makedirs(models_dir, exist_ok=True)

    apps_path = os.path.join(data_dir, "applications.csv")
    citizens_path = os.path.join(data_dir, "citizens.csv")

    apps_df = pd.read_csv(apps_path)
    citizens_df = pd.read_csv(citizens_path)

    merged_df = apps_df.merge(citizens_df, on="citizen_id", how="left")
    X, y, feature_names = prepare_features(apps_df, citizens_df)
    groups = merged_df["citizen_id"]

    # 1. GROUP-AWARE SPLIT (Preventing citizen-level data leakage)
    gss = GroupShuffleSplit(n_splits=1, test_size=0.25, random_state=random_state)
    train_idx, test_idx = next(gss.split(X, y, groups=groups))

    X_train, X_test = X.iloc[train_idx], X.iloc[test_idx]
    y_train, y_test = y.iloc[train_idx], y.iloc[test_idx]
    groups_train, groups_test = groups.iloc[train_idx], groups.iloc[test_idx]

    train_citizens = groups_train.unique()
    test_citizens = groups_test.unique()

    # Perform strict anti-leakage validation checks
    validate_anti_leakage(feature_names, train_citizens, test_citizens)

    print("==================================================")
    print("UCMS FRAUD ML TRAINING")
    print("==================================================")
    print(f"Applications           : {len(X)}")
    print(f"Citizens               : {len(groups.unique())}")
    print(f"Normal                 : {(y == 0).sum()}")
    print(f"Fraud                  : {(y == 1).sum()}")
    print("")
    print(f"Training applications  : {len(X_train)}")
    print(f"Testing applications   : {len(X_test)}")
    print(f"Training citizens      : {len(train_citizens)}")
    print(f"Testing citizens       : {len(test_citizens)}")
    print(f"Citizen overlap        : 0")
    print("")
    print("Features:")
    for f in feature_names:
        print(f" - {f}")

    # 2. MODEL TRAINING (Interpretable DecisionTree with class balance)
    clf = DecisionTreeClassifier(
        max_depth=5,
        min_samples_split=4,
        class_weight="balanced",
        random_state=random_state
    )
    clf.fit(X_train, y_train)

    # 3. EVALUATION
    y_pred = clf.predict(X_test)
    y_pred_proba = clf.predict_proba(X_test)[:, 1]

    acc = accuracy_score(y_test, y_pred)
    prec = precision_score(y_test, y_pred, zero_division=0)
    rec = recall_score(y_test, y_pred, zero_division=0)
    f1 = f1_score(y_test, y_pred, zero_division=0)
    auc_score = roc_auc_score(y_test, y_pred_proba)
    cm = confusion_matrix(y_test, y_pred)

    print("\n==================================================")
    print("MODEL PERFORMANCE")
    print("==================================================")
    print(f"Accuracy  : {acc * 100:.2f}%")
    print(f"Precision : {prec * 100:.2f}%")
    print(f"Recall    : {rec * 100:.2f}%")
    print(f"F1 Score  : {f1 * 100:.2f}%")
    print(f"ROC-AUC   : {auc_score:.4f}")

    print("\n==================================================")
    print("FRAUD CLASS PERFORMANCE")
    print("==================================================")
    print(f"Precision : {prec * 100:.2f}%")
    print(f"Recall    : {rec * 100:.2f}%")
    print(f"F1 Score  : {f1 * 100:.2f}%")

    print("\nDetailed Classification Report:")
    print(classification_report(y_test, y_pred, target_names=["Normal (0)", "Fraud (1)"], zero_division=0))

    # 4. FEATURE IMPORTANCE
    importances = clf.feature_importances_
    fi_df = pd.DataFrame({
        "Feature": feature_names,
        "Importance": importances
    }).sort_values(by="Importance", ascending=False)

    print("==================================================")
    print("FEATURE IMPORTANCE")
    print("==================================================")
    for _, row in fi_df.iterrows():
        print(f"  {row['Feature']:<32}: {row['Importance']:.4f}")

    # Save feature importance CSV
    fi_csv_path = os.path.join(models_dir, "feature_importance.csv")
    fi_df.to_csv(fi_csv_path, index=False)

    # 5. GENERATE PLOTS
    # Feature Importance Plot
    plt.figure(figsize=(10, 6))
    plt.barh(fi_df["Feature"][::-1], fi_df["Importance"][::-1])
    plt.xlabel("Importance")
    plt.ylabel("Feature")
    plt.title("Decision Tree Feature Importance")
    plt.tight_layout()
    fi_png_path = os.path.join(models_dir, "feature_importance.png")
    plt.savefig(fi_png_path)
    plt.close()

    # Confusion Matrix Plot
    plt.figure(figsize=(6, 5))
    sns.heatmap(cm, annot=True, fmt="d", cmap="Blues", xticklabels=["Normal", "Fraud"], yticklabels=["Normal", "Fraud"])
    plt.title("Confusion Matrix")
    plt.xlabel("Predicted")
    plt.ylabel("Actual")
    plt.tight_layout()
    cm_png_path = os.path.join(models_dir, "confusion_matrix.png")
    plt.savefig(cm_png_path)
    plt.close()

    # ROC Curve Plot
    fpr, tpr, _ = roc_curve(y_test, y_pred_proba)
    plt.figure(figsize=(6, 5))
    plt.plot(fpr, tpr, label=f"ROC Curve (AUC = {auc_score:.4f})")
    plt.plot([0, 1], [0, 1], linestyle="--", label="Random Classifier")
    plt.xlabel("False Positive Rate")
    plt.ylabel("True Positive Rate")
    plt.title("Receiver Operating Characteristic (ROC) Curve")
    plt.legend(loc="lower right")
    plt.tight_layout()
    roc_png_path = os.path.join(models_dir, "roc_curve.png")
    plt.savefig(roc_png_path)
    plt.close()

    # 6. SAVE MODEL & METADATA ARTIFACTS
    model_artifact = {
        "model": clf,
        "feature_names": feature_names,
        "model_type": "DecisionTreeClassifier",
        "random_state": random_state
    }
    model_path = os.path.join(models_dir, "fraud_model.joblib")
    joblib.dump(model_artifact, model_path)

    metadata = {
        "model_type": "DecisionTreeClassifier",
        "description": "Baseline ML fraud classifier trained and evaluated on synthetic UCMS application data.",
        "random_state": random_state,
        "total_applications": int(len(X)),
        "total_citizens": int(len(groups.unique())),
        "training_applications": int(len(X_train)),
        "testing_applications": int(len(X_test)),
        "training_citizens": int(len(train_citizens)),
        "testing_citizens": int(len(test_citizens)),
        "citizen_overlap": 0,
        "fraud_count": int((y == 1).sum()),
        "normal_count": int((y == 0).sum()),
        "feature_names": feature_names,
        "accuracy": round(float(acc), 4),
        "precision": round(float(prec), 4),
        "recall": round(float(rec), 4),
        "f1_score": round(float(f1), 4),
        "roc_auc": round(float(auc_score), 4)
    }
    metadata_path = os.path.join(models_dir, "fraud_model_metadata.json")
    with open(metadata_path, "w") as f:
        json.dump(metadata, f, indent=4)

    print("\n==================================================")
    print("MODEL SAVED")
    print("==================================================")
    print(f"Model Artifact   : {model_path}")
    print(f"Metadata JSON    : {metadata_path}")
    print(f"Feature CSV      : {fi_csv_path}")
    print(f"Plots Generated  : {fi_png_path}, {cm_png_path}, {roc_png_path}")
    print("\nTraining completed successfully.")

    return metadata

if __name__ == "__main__":
    train_fraud_model()
