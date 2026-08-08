"""
Citizen Profile Analyzer Module
Unified Citizen Management System (UCMS) for Village Administration

Transforms raw citizen administrative data into enriched analytical profile features
suitable for recommendation scoring and vulnerability targeting.
"""

import pandas as pd
import numpy as np

class CitizenProfileAnalyzer:
    """
    Transforms raw citizen records into structured feature matrices and vulnerability scores.
    """
    def __init__(self):
        pass

    def categorize_age(self, age):
        if age < 35:
            return "Youth (18-34)"
        elif age < 60:
            return "Middle-Aged (35-59)"
        else:
            return "Senior Citizen (60+)"

    def categorize_income(self, income):
        if income <= 60000:
            return "Ultra Low Income (<=60k)"
        elif income <= 120000:
            return "Low Income (60k-120k)"
        elif income <= 250000:
            return "Middle Income (120k-250k)"
        else:
            return "Higher Income (>250k)"

    def categorize_occupation(self, occupation):
        occ = str(occupation).lower()
        if "farmer" in occ or "agricultural" in occ:
            return "Agriculture"
        elif "business" in occ or "artisan" in occ:
            return "Self-Employed/Artisan"
        elif "student" in occ or "unemployed" in occ:
            return "Student/Unemployed"
        else:
            return "Service/Other"

    def categorize_land(self, land_area):
        if land_area <= 0.0:
            return "Landless (0.0 acres)"
        elif land_area <= 1.0:
            return "Marginal (<1.0 acre)"
        elif land_area <= 2.5:
            return "Small (1.0-2.5 acres)"
        else:
            return "Medium/Large (>2.5 acres)"

    def categorize_family(self, family_size):
        if family_size <= 2:
            return "Small Family (1-2)"
        elif family_size <= 5:
            return "Medium Family (3-5)"
        else:
            return "Large Family (6+)"

    def calculate_vulnerability_score(self, citizen):
        """
        Calculates a synthetic multi-factor vulnerability score between 0 and 100.
        Factors: Low Income, Disability, Kutcha Housing, Seniority, Landlessness, AAY Ration Card.
        """
        score = 0.0

        # Income factor (Max 35 pts)
        income = citizen.get("annual_income", 150000)
        if income <= 60000:
            score += 35.0
        elif income <= 120000:
            score += 25.0
        elif income <= 200000:
            score += 10.0

        # Housing Condition (Max 20 pts)
        housing = citizen.get("housing_condition", "Pucca")
        if housing == "Kutcha":
            score += 20.0
        elif housing == "Semi-Pucca":
            score += 10.0

        # Disability Status (Max 15 pts)
        if citizen.get("disability_status", False):
            score += 15.0

        # Ration Card (Max 15 pts)
        ration = citizen.get("ration_card", "None")
        if ration == "AAY": # Antyodaya Anna Yojana (poorest of poor)
            score += 15.0
        elif ration == "PHH": # Priority Household
            score += 10.0

        # Age Vulnerability (Max 10 pts)
        age = citizen.get("age", 30)
        if age >= 65:
            score += 10.0
        elif age >= 60:
            score += 5.0

        # Landlessness (Max 5 pts)
        if citizen.get("land_area", 0.0) <= 0.0:
            score += 5.0

        return min(100.0, round(score, 2))

    def calculate_document_readiness(self, citizen):
        """
        Evaluates document readiness percentage (0-100) based on verified identity, bank account, and ration card.
        """
        score = 0
        if citizen.get("aadhaar_verified", False):
            score += 40
        if citizen.get("bank_account", False):
            score += 40
        if citizen.get("ration_card", "None") in ["PHH", "NPHH", "AAY"]:
            score += 20
        return score

    def analyze_profile(self, citizen_data):
        """
        Main entry point for single citizen dictionary or pandas Series.
        Returns enriched analytical profile dictionary.
        """
        if isinstance(citizen_data, pd.Series):
            citizen = citizen_data.to_dict()
        else:
            citizen = citizen_data

        age = citizen.get("age", 30)
        income = citizen.get("annual_income", 0)
        land = citizen.get("land_area", 0.0)
        occ = citizen.get("occupation", "Unemployed")
        fam = citizen.get("family_size", 1)

        enriched = {
            "citizen_id": citizen.get("citizen_id", "UNKNOWN"),
            "raw_age": age,
            "raw_income": income,
            "raw_land_area": land,
            "raw_occupation": occ,
            "age_group": self.categorize_age(age),
            "income_category": self.categorize_income(income),
            "occupation_category": self.categorize_occupation(occ),
            "land_category": self.categorize_land(land),
            "family_category": self.categorize_family(fam),
            "vulnerability_score": self.calculate_vulnerability_score(citizen),
            "farmer_indicator": bool(citizen.get("farmer_status", False) or "farmer" in str(occ).lower()),
            "senior_citizen_indicator": bool(age >= 60),
            "document_readiness": self.calculate_document_readiness(citizen),
            "bank_account": citizen.get("bank_account", False),
            "aadhaar_verified": citizen.get("aadhaar_verified", False),
            "existing_scheme_count": citizen.get("existing_scheme_count", 0),
            "village": citizen.get("village", "Unknown")
        }
        return enriched

    def analyze_dataset(self, df):
        """
        Applies profile analysis over a pandas DataFrame of citizens.
        """
        analyzed_records = [self.analyze_profile(row) for _, row in df.iterrows()]
        return pd.DataFrame(analyzed_records)

if __name__ == "__main__":
    # Self-test code
    sample_citizen = {
        "citizen_id": "CIT10001",
        "age": 62,
        "annual_income": 45000,
        "occupation": "Agricultural Laborer",
        "land_area": 0.5,
        "family_size": 4,
        "disability_status": False,
        "housing_condition": "Kutcha",
        "ration_card": "AAY",
        "aadhaar_verified": True,
        "bank_account": True,
        "farmer_status": True,
        "existing_scheme_count": 1
    }
    analyzer = CitizenProfileAnalyzer()
    profile = analyzer.analyze_profile(sample_citizen)
    print("Enriched Citizen Profile Sample:")
    for k, v in profile.items():
        print(f"  {k}: {v}")
