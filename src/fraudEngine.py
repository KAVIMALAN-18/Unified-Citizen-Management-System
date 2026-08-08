"""
Fraud Intelligence Engine Module
Unified Citizen Management System (UCMS) for Village Administration

Analyzes synthetic application records to detect suspicious patterns and compute rule-based fraud risk scores.
Evaluates indicators:
 - Duplicate Identity Flag
 - Income Mismatch Flag (Declared vs Verified Profile Income)
 - Land Area Mismatch Flag (Declared vs Verified Land Holding)
 - Multiple Active Scheme Claims Flag
 - Document Deficit Anomalies
 - Rapid Repeated Submissions
"""

import pandas as pd
import numpy as np

class FraudIntelligenceEngine:
    """
    Rule-based Fraud Risk Detection and Intelligence Analysis Engine.
    """
    def __init__(self, citizens_filepath="data/citizens.csv"):
        try:
            citizens_df = pd.read_csv(citizens_filepath)
            self.citizen_lookup = citizens_df.set_index("citizen_id").to_dict("index")
        except Exception:
            self.citizen_lookup = {}

    def analyze_application(self, application, citizen_profile=None):
        """
        Analyzes a single application dictionary or pandas Series and computes fraud risk score (0-100),
        risk classification level, detected indicators, and explanatory feedback.
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

        risk_score = 0.0
        indicators = []
        explanation = []

        # -------------------------------------------------------------
        # 1. DUPLICATE IDENTITY ANOMALY (Max +35 pts)
        # -------------------------------------------------------------
        dup_flag = app.get("duplicate_identity_flag", 0)
        if dup_flag == 1 or dup_flag is True:
            risk_score += 35.0
            indicators.append("Duplicate Identity Flag")
            explanation.append("Multiple applications submitted using identical or near-identical personal identity markers.")

        # -------------------------------------------------------------
        # 2. INCOME MISMATCH ANOMALY (Max +30 pts)
        # -------------------------------------------------------------
        declared_inc = app.get("declared_income", None)
        actual_inc = c_profile.get("annual_income", c_profile.get("raw_income", None))
        inc_flag = app.get("income_mismatch_flag", 0)

        if inc_flag == 1 or inc_flag is True:
            risk_score += 30.0
            indicators.append("Income Mismatch Anomaly")
            explanation.append(f"Significant discrepancy detected between declared application income (INR {declared_inc:,}) and verified citizen record (INR {actual_inc:,})." if (declared_inc and actual_inc) else "Income mismatch flag triggered.")
        elif declared_inc is not None and actual_inc is not None and actual_inc > 0:
            diff_pct = abs(declared_inc - actual_inc) / float(actual_inc)
            if diff_pct > 0.35: # >35% divergence
                pts = min(25.0, round(diff_pct * 30.0, 1))
                risk_score += pts
                indicators.append("Income Divergence Anomaly")
                explanation.append(f"Declared income (INR {declared_inc:,}) deviates by {diff_pct*100:.1f}% from verified profile income (INR {actual_inc:,}).")

        # -------------------------------------------------------------
        # 3. LAND AREA MISMATCH ANOMALY (Max +25 pts)
        # -------------------------------------------------------------
        declared_land = app.get("declared_land_area", None)
        actual_land = c_profile.get("land_area", c_profile.get("raw_land_area", None))
        land_flag = app.get("land_mismatch_flag", 0)

        if land_flag == 1 or land_flag is True:
            risk_score += 25.0
            indicators.append("Land Area Mismatch")
            explanation.append(f"Declared land area ({declared_land} acres) conflicts with revenue land registry records ({actual_land} acres)." if (declared_land is not None and actual_land is not None) else "Land area mismatch flag triggered.")
        elif declared_land is not None and actual_land is not None:
            land_diff = abs(declared_land - actual_land)
            if land_diff > 1.5:
                pts = min(20.0, round(land_diff * 5.0, 1))
                risk_score += pts
                indicators.append("Land Area Deviation")
                explanation.append(f"Declared land ({declared_land} acres) differs significantly from revenue record ({actual_land} acres).")

        # -------------------------------------------------------------
        # 4. MULTIPLE SCHEME OVER-CLAIMING (Max +15 pts)
        # -------------------------------------------------------------
        mult_flag = app.get("multiple_scheme_flag", 0)
        if mult_flag == 1 or mult_flag is True:
            risk_score += 15.0
            indicators.append("Multiple Concurrent Scheme Claims")
            explanation.append("Applicant has simultaneously applied for multiple overlapping or non-combinable government benefit schemes.")

        # -------------------------------------------------------------
        # 5. DOCUMENT DEFICIT ANOMALY (Max +10 pts)
        # -------------------------------------------------------------
        doc_count = app.get("document_count", 4)
        if doc_count < 2:
            risk_score += 10.0
            indicators.append("Severe Document Deficiency")
            explanation.append(f"Only {doc_count} document(s) uploaded; missing mandatory verification attachments.")

        # Cap score to 100
        final_score = int(np.round(min(100.0, max(0.0, risk_score))))

        # Determine risk level
        if final_score <= 30:
            risk_level = "LOW"
        elif final_score <= 60:
            risk_level = "MEDIUM"
        else:
            risk_level = "HIGH"

        if not indicators:
            explanation.append("Application passes standard fraud intelligence checks with clean records.")

        return {
            "application_id": app_id,
            "citizen_id": cid,
            "risk_score": final_score,
            "risk_level": risk_level,
            "indicators": indicators,
            "explanation": explanation
        }

    def analyze_dataset(self, applications_df):
        """
        Processes a dataset of applications and appends fraud scores and risk categories.
        """
        results = [self.analyze_application(row) for _, row in applications_df.iterrows()]
        res_df = pd.DataFrame(results)
        return res_df

if __name__ == "__main__":
    # Test execution
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

    sample_citizen = {
        "citizen_id": "CIT10001",
        "annual_income": 85000,
        "land_area": 0.5
    }

    engine = FraudIntelligenceEngine()
    analysis = engine.analyze_application(sample_app, sample_citizen)

    print("\nFraud Intelligence Engine Analysis Result:")
    print(f"Application ID : {analysis['application_id']}")
    print(f"Risk Score     : {analysis['risk_score']}/100")
    print(f"Risk Level     : {analysis['risk_level']}")
    print("Indicators     :")
    for ind in analysis['indicators']:
        print(f"  - {ind}")
    print("Explanation    :")
    for exp in analysis['explanation']:
        print(f"  - {exp}")
