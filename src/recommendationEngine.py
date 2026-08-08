"""
Dynamic Scheme Recommendation Engine Module
Unified Citizen Management System (UCMS) for Village Administration

Multi-Factor Dynamic Scoring & Scheme Matching Engine for synthetic citizen profiles.
Evaluation factors:
 1. Hard Eligibility Gate (Age, Income, Occupation, Land, Disability, Farmer status)
 2. Vulnerability Priority Adjustment
 3. Document Readiness Fit
 4. Existing Benefits Distribution Balance
 5. Scheme Strategic Priority
"""

import pandas as pd
import numpy as np

class RecommendationEngine:
    """
    Evaluates citizen profiles against village government schemes using multi-factor scoring.
    """
    def __init__(self, schemes_filepath="data/schemes.csv"):
        self.schemes_df = pd.read_csv(schemes_filepath)

    def evaluate_eligibility_and_score(self, profile, scheme):
        """
        Evaluates hard constraints and computes multi-factor recommendation score (0-100).
        """
        reasons = []
        missing_documents = []
        is_eligible = True
        failed_criteria = []

        # Extract citizen parameters
        age = profile.get("raw_age", profile.get("age", 0))
        income = profile.get("raw_income", profile.get("annual_income", 0))
        land = profile.get("raw_land_area", profile.get("land_area", 0.0))
        occ = str(profile.get("raw_occupation", profile.get("occupation", ""))).lower()
        is_disabled = profile.get("disability_status", False)
        is_farmer = profile.get("farmer_indicator", profile.get("farmer_status", False))
        vuln_score = profile.get("vulnerability_score", 50.0)
        existing_schemes = profile.get("existing_scheme_count", 0)

        # -----------------------------------------------------------------
        # 1. HARD ELIGIBILITY CHECKS
        # -----------------------------------------------------------------
        min_age = scheme.get("minimum_age", 0)
        max_age = scheme.get("maximum_age", 120)
        if min_age <= age <= max_age:
            reasons.append(f"Age criterion met ({age} years is within {min_age}-{max_age}).")
        else:
            is_eligible = False
            failed_criteria.append(f"Age {age} outside required range ({min_age}-{max_age}).")

        max_income = scheme.get("maximum_income", 9999999)
        if income <= max_income:
            reasons.append(f"Income criterion met (INR {income:,} <= INR {max_income:,} limit).")
        else:
            is_eligible = False
            failed_criteria.append(f"Income INR {income:,} exceeds maximum limit INR {max_income:,}.")

        req_occ = str(scheme.get("required_occupation", "Any"))
        if req_occ.lower() != "any":
            if req_occ.lower() in occ or (req_occ.lower() == "farmer" and is_farmer):
                reasons.append(f"Occupation match satisfied for '{req_occ}'.")
            else:
                is_eligible = False
                failed_criteria.append(f"Required occupation '{req_occ}' does not match '{occ}'.")

        min_land = scheme.get("minimum_land_area", 0.0)
        max_land = scheme.get("maximum_land_area", 999.0)
        if min_land <= land <= max_land:
            reasons.append(f"Land holding criterion met ({land} acres is within {min_land}-{max_land} acres).")
        else:
            is_eligible = False
            failed_criteria.append(f"Land holding {land} acres outside limit ({min_land}-{max_land} acres).")

        if scheme.get("requires_disability", False):
            if is_disabled:
                reasons.append("Disability criterion satisfied.")
            else:
                is_eligible = False
                failed_criteria.append("Scheme requires differently-abled status.")

        if scheme.get("requires_farmer", False):
            if is_farmer:
                reasons.append("Farmer status confirmed.")
            else:
                is_eligible = False
                failed_criteria.append("Scheme requires registered farmer status.")

        # Document assessment
        req_docs = str(scheme.get("required_documents", "")).split(",")
        req_docs = [d.strip() for d in req_docs if d.strip()]
        
        # Check standard available documents
        available_docs = set()
        if profile.get("aadhaar_verified", False):
            available_docs.add("Aadhaar")
        if profile.get("bank_account", False):
            available_docs.add("Bank_Passbook")
        if profile.get("ration_card", "None") != "None":
            available_docs.add("Ration_Card")
            if profile.get("ration_card") == "AAY":
                available_docs.add("AAY_Ration_Card")
        if is_farmer:
            available_docs.add("Land_Patta")
            available_docs.add("Farmer_ID")
            available_docs.add("Adangal_Record")
        if age >= 60:
            available_docs.add("Age_Proof")
        if income <= 100000:
            available_docs.add("Income_Certificate")
        if is_disabled:
            available_docs.add("Disability_Certificate")

        for d in req_docs:
            if d not in available_docs:
                missing_documents.append(d)

        # -----------------------------------------------------------------
        # 2. MULTI-FACTOR RECOMMENDATION SCORING (0-100)
        # -----------------------------------------------------------------
        if not is_eligible:
            # If not strictly eligible, return score 0 with reasons for failure
            return {
                "scheme_id": scheme["scheme_id"],
                "scheme_name": scheme["scheme_name"],
                "eligible": False,
                "score": 0,
                "reasons": failed_criteria,
                "missing_documents": missing_documents
            }

        base_score = 40.0 # Base points for meeting all eligibility criteria

        # Factor A: Income Need Ratio (Max 20 pts)
        # Lower income relative to scheme max_income yields higher financial need score
        income_ratio = 1.0 - min(1.0, income / max_income)
        income_pts = income_ratio * 20.0
        base_score += income_pts
        if income_ratio > 0.5:
            reasons.append("High financial suitability: Citizen income is significantly below scheme maximum threshold.")

        # Factor B: Vulnerability Alignment (Max 15 pts)
        vulnerability_pts = (vuln_score / 100.0) * 15.0
        base_score += vulnerability_pts
        if vuln_score > 60:
            reasons.append(f"High social vulnerability score ({vuln_score:.1f}/100) increases scheme prioritization.")

        # Factor C: Document Readiness Fit (Max 10 pts)
        doc_readiness = profile.get("document_readiness", 80)
        if len(req_docs) > 0:
            doc_ratio = max(0.0, 1.0 - (len(missing_documents) / len(req_docs)))
        else:
            doc_ratio = 1.0
        doc_pts = doc_ratio * 10.0
        base_score += doc_pts
        if len(missing_documents) == 0:
            reasons.append("100% Document readiness: All required documentation is available.")

        # Factor D: Existing Benefit Equity (Max 10 pts)
        # Citizens receiving fewer existing benefits get higher priority
        benefit_pts = max(0.0, 10.0 - (existing_schemes * 2.5))
        base_score += benefit_pts
        if existing_schemes <= 1:
            reasons.append("Equitable distribution boost: Citizen has 1 or zero active government benefits.")

        # Factor E: Scheme Strategic Priority Level (Max 5 pts)
        priority_lvl = scheme.get("priority_level", 2)
        priority_pts = (4 - min(3, priority_lvl)) * 2.5
        base_score += priority_pts

        final_score = int(np.round(min(100.0, max(0.0, base_score))))

        return {
            "scheme_id": scheme["scheme_id"],
            "scheme_name": scheme["scheme_name"],
            "eligible": True,
            "score": final_score,
            "reasons": reasons,
            "missing_documents": missing_documents
        }

    def recommend_schemes(self, profile, top_n=5):
        """
        Evaluates all synthetic schemes for a citizen profile and returns ranked recommendations.
        """
        results = []
        for _, scheme in self.schemes_df.iterrows():
            eval_res = self.evaluate_eligibility_and_score(profile, scheme)
            results.append(eval_res)

        # Sort: Eligible first, then descending by score
        results.sort(key=lambda x: (x["eligible"], x["score"]), reverse=True)
        return results[:top_n]

if __name__ == "__main__":
    from citizenProfileAnalyzer import CitizenProfileAnalyzer

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

    analyzer = CitizenProfileAnalyzer()
    profile = analyzer.analyze_profile(sample_citizen)

    rec_engine = RecommendationEngine()
    recommendations = rec_engine.recommend_schemes(profile, top_n=3)

    print("\nTop Scheme Recommendations:")
    for idx, rec in enumerate(recommendations, 1):
        print(f"\n{idx}. [{rec['scheme_id']}] {rec['scheme_name']}")
        print(f"   Eligible: {rec['eligible']} | Score: {rec['score']}/100")
        print("   Reasons:")
        for r in rec["reasons"]:
            print(f"     - {r}")
        if rec["missing_documents"]:
            print(f"   Missing Documents: {', '.join(rec['missing_documents'])}")
