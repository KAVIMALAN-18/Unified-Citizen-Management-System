import os
import pandas as pd
import numpy as np

def generate_synthetic_datasets(data_dir="data", seed=42):
    np.random.seed(seed)
    os.makedirs(data_dir, exist_ok=True)

    # -------------------------------------------------------------
    # 1. GENERATE CITIZENS (500 synthetic citizens)
    # -------------------------------------------------------------
    n_citizens = 500
    villages = ["Kovilpatti", "Sundarpuram", "Melur", "Perur", "Vadapalani", "Keeranur", "Chinnamanur"]
    occupations = [
        "Farmer", "Agricultural Laborer", "Small Business Owner",
        "Student", "Unemployed", "Artisan", "Private Service", "Retired"
    ]
    occupation_weights = [0.35, 0.20, 0.10, 0.10, 0.10, 0.05, 0.05, 0.05]

    education_levels = ["Illiterate", "Primary", "Secondary", "Higher Secondary", "Graduate"]
    education_weights = [0.20, 0.25, 0.30, 0.15, 0.10]

    housing_conditions = ["Kutcha", "Semi-Pucca", "Pucca"]
    housing_weights = [0.40, 0.35, 0.25]

    health_conditions = ["Good", "Chronic Illness", "Disabled", "Minor Ailment"]
    health_weights = [0.70, 0.15, 0.08, 0.07]

    ration_cards = ["PHH", "NPHH", "AAY", "None"]
    ration_weights = [0.55, 0.25, 0.15, 0.05]

    citizen_ids = [f"CIT{10001 + i}" for i in range(n_citizens)]
    ages = np.random.randint(18, 85, size=n_citizens)
    genders = np.random.choice(["Male", "Female", "Other"], size=n_citizens, p=[0.49, 0.49, 0.02])

    incomes = []
    land_areas = []
    farmer_statuses = []
    senior_citizens = []

    for i in range(n_citizens):
        occ = np.random.choice(occupations, p=occupation_weights)
        
        if occ in ["Farmer", "Agricultural Laborer"]:
            inc = int(np.random.gamma(shape=3.0, scale=18000))
        elif occ == "Small Business Owner":
            inc = int(np.random.gamma(shape=4.0, scale=35000))
        elif occ == "Student":
            inc = int(np.random.gamma(shape=1.5, scale=12000))
        elif occ == "Unemployed":
            inc = int(np.random.gamma(shape=1.2, scale=15000))
        elif occ == "Artisan":
            inc = int(np.random.gamma(shape=2.5, scale=25000))
        else:
            inc = int(np.random.gamma(shape=3.5, scale=40000))

        inc = max(12000, min(inc, 450000))
        incomes.append(inc)

        is_farmer = (occ == "Farmer") or (np.random.rand() < 0.15 and occ != "Student")
        farmer_statuses.append(is_farmer)

        if is_farmer:
            land = round(float(np.random.exponential(scale=2.2)), 2)
            land = max(0.2, min(land, 12.0))
        else:
            land = round(float(np.random.exponential(scale=0.3)) if np.random.rand() < 0.25 else 0.0, 2)
            land = min(land, 4.0)
        land_areas.append(land)

        senior_citizens.append(bool(ages[i] >= 60))

    family_sizes = np.random.choice([1, 2, 3, 4, 5, 6, 7, 8], size=n_citizens, p=[0.05, 0.15, 0.25, 0.30, 0.12, 0.08, 0.03, 0.02])
    disability_statuses = [bool(h == "Disabled" or np.random.rand() < 0.04) for h in np.random.choice(health_conditions, size=n_citizens, p=health_weights)]
    marital_statuses = np.random.choice(["Single", "Married", "Widowed", "Divorced"], size=n_citizens, p=[0.20, 0.65, 0.12, 0.03])
    employment_statuses = np.random.choice(["Employed", "Unemployed", "Self-Employed", "Seasonal"], size=n_citizens, p=[0.40, 0.20, 0.25, 0.15])
    assigned_villages = np.random.choice(villages, size=n_citizens)
    existing_scheme_counts = np.random.choice([0, 1, 2, 3, 4], size=n_citizens, p=[0.35, 0.35, 0.20, 0.07, 0.03])
    bank_accounts = np.random.choice([True, False], size=n_citizens, p=[0.92, 0.08])
    ration_card_types = np.random.choice(ration_cards, size=n_citizens, p=ration_weights)
    aadhaar_verified_list = np.random.choice([True, False], size=n_citizens, p=[0.95, 0.05])
    housing_list = np.random.choice(housing_conditions, size=n_citizens, p=housing_weights)
    health_list = np.random.choice(health_conditions, size=n_citizens, p=health_weights)
    prev_benefits = np.random.choice([True, False], size=n_citizens, p=[0.45, 0.55])
    education_list = np.random.choice(education_levels, size=n_citizens, p=education_weights)
    occ_list = [np.random.choice(occupations, p=occupation_weights) for _ in range(n_citizens)]

    citizens_df = pd.DataFrame({
        "citizen_id": citizen_ids,
        "age": ages,
        "gender": genders,
        "annual_income": incomes,
        "occupation": occ_list,
        "land_area": land_areas,
        "family_size": family_sizes,
        "education_level": education_list,
        "disability_status": disability_statuses,
        "marital_status": marital_statuses,
        "employment_status": employment_statuses,
        "village": assigned_villages,
        "existing_scheme_count": existing_scheme_counts,
        "bank_account": bank_accounts,
        "ration_card": ration_card_types,
        "aadhaar_verified": aadhaar_verified_list,
        "housing_condition": housing_list,
        "health_condition": health_list,
        "farmer_status": farmer_statuses,
        "senior_citizen": senior_citizens,
        "previous_benefit_received": prev_benefits
    })

    citizens_path = os.path.join(data_dir, "citizens.csv")
    citizens_df.to_csv(citizens_path, index=False)

    # -------------------------------------------------------------
    # 2. GENERATE SCHEMES (12 synthetic government schemes)
    # -------------------------------------------------------------
    schemes_data = [
        {
            "scheme_id": "SCH001",
            "scheme_name": "Senior Citizen Welfare Support Scheme (DEMO)",
            "minimum_age": 60,
            "maximum_age": 120,
            "maximum_income": 120000,
            "required_occupation": "Any",
            "minimum_land_area": 0.0,
            "maximum_land_area": 5.0,
            "requires_disability": False,
            "requires_farmer": False,
            "priority_level": 1,
            "required_documents": "Aadhaar,Ration_Card,Age_Proof,Bank_Passbook"
        },
        {
            "scheme_id": "SCH002",
            "scheme_name": "Small & Marginal Farmer Assistance Scheme (DEMO)",
            "minimum_age": 18,
            "maximum_age": 75,
            "maximum_income": 150000,
            "required_occupation": "Farmer",
            "minimum_land_area": 0.1,
            "maximum_land_area": 5.0,
            "requires_disability": False,
            "requires_farmer": True,
            "priority_level": 1,
            "required_documents": "Aadhaar,Land_Patta,Bank_Passbook,Farmer_ID"
        },
        {
            "scheme_id": "SCH003",
            "scheme_name": "Rural Kutcha Housing Upgrade Grant (DEMO)",
            "minimum_age": 21,
            "maximum_age": 80,
            "maximum_income": 90000,
            "required_occupation": "Any",
            "minimum_land_area": 0.0,
            "maximum_land_area": 2.0,
            "requires_disability": False,
            "requires_farmer": False,
            "priority_level": 1,
            "required_documents": "Aadhaar,Ration_Card,Income_Certificate,House_Photo"
        },
        {
            "scheme_id": "SCH004",
            "scheme_name": "Rural Student Higher Education Scholarship (DEMO)",
            "minimum_age": 17,
            "maximum_age": 25,
            "maximum_income": 200000,
            "required_occupation": "Student",
            "minimum_land_area": 0.0,
            "maximum_land_area": 10.0,
            "requires_disability": False,
            "requires_farmer": False,
            "priority_level": 2,
            "required_documents": "Aadhaar,Marklist,Income_Certificate,College_ID"
        },
        {
            "scheme_id": "SCH005",
            "scheme_name": "Women Micro-Entrepreneurship Support Scheme (DEMO)",
            "minimum_age": 20,
            "maximum_age": 55,
            "maximum_income": 180000,
            "required_occupation": "Any",
            "minimum_land_area": 0.0,
            "maximum_land_area": 5.0,
            "requires_disability": False,
            "requires_farmer": False,
            "priority_level": 2,
            "required_documents": "Aadhaar,SHG_Membership,Bank_Passbook,Business_Plan"
        },
        {
            "scheme_id": "SCH006",
            "scheme_name": "Differently-Abled Pension & Care Scheme (DEMO)",
            "minimum_age": 18,
            "maximum_age": 100,
            "maximum_income": 150000,
            "required_occupation": "Any",
            "minimum_land_area": 0.0,
            "maximum_land_area": 10.0,
            "requires_disability": True,
            "requires_farmer": False,
            "priority_level": 1,
            "required_documents": "Aadhaar,Disability_Certificate,Bank_Passbook"
        },
        {
            "scheme_id": "SCH007",
            "scheme_name": "Village Critical Health Financial Aid (DEMO)",
            "minimum_age": 18,
            "maximum_age": 90,
            "maximum_income": 100000,
            "required_occupation": "Any",
            "minimum_land_area": 0.0,
            "maximum_land_area": 3.0,
            "requires_disability": False,
            "requires_farmer": False,
            "priority_level": 2,
            "required_documents": "Aadhaar,Medical_Report,Income_Certificate,Bank_Passbook"
        },
        {
            "scheme_id": "SCH008",
            "scheme_name": "Dryland Farmer Well & Irrigation Subsidy (DEMO)",
            "minimum_age": 21,
            "maximum_age": 70,
            "maximum_income": 250000,
            "required_occupation": "Farmer",
            "minimum_land_area": 1.0,
            "maximum_land_area": 10.0,
            "requires_disability": False,
            "requires_farmer": True,
            "priority_level": 2,
            "required_documents": "Aadhaar,Land_Patta,Adangal_Record,Bank_Passbook"
        },
        {
            "scheme_id": "SCH009",
            "scheme_name": "Ultra Low-Income Family Welfare Support (DEMO)",
            "minimum_age": 18,
            "maximum_age": 80,
            "maximum_income": 60000,
            "required_occupation": "Any",
            "minimum_land_area": 0.0,
            "maximum_land_area": 1.0,
            "requires_disability": False,
            "requires_farmer": False,
            "priority_level": 1,
            "required_documents": "Aadhaar,AAY_Ration_Card,Income_Certificate"
        },
        {
            "scheme_id": "SCH010",
            "scheme_name": "Rural Artisan Skill Upgrade & Toolkit Grant (DEMO)",
            "minimum_age": 18,
            "maximum_age": 50,
            "maximum_income": 160000,
            "required_occupation": "Artisan",
            "minimum_land_area": 0.0,
            "maximum_land_area": 2.0,
            "requires_disability": False,
            "requires_farmer": False,
            "priority_level": 3,
            "required_documents": "Aadhaar,Artisan_ID,Bank_Passbook"
        },
        {
            "scheme_id": "SCH011",
            "scheme_name": "Agricultural Mechanization Subsidy (DEMO)",
            "minimum_age": 21,
            "maximum_age": 65,
            "maximum_income": 300000,
            "required_occupation": "Farmer",
            "minimum_land_area": 2.0,
            "maximum_land_area": 12.0,
            "requires_disability": False,
            "requires_farmer": True,
            "priority_level": 3,
            "required_documents": "Aadhaar,Land_Patta,Quotation,Bank_Passbook"
        },
        {
            "scheme_id": "SCH012",
            "scheme_name": "Senior Citizen Medical Allowance (DEMO)",
            "minimum_age": 65,
            "maximum_age": 120,
            "maximum_income": 140000,
            "required_occupation": "Any",
            "minimum_land_area": 0.0,
            "maximum_land_area": 5.0,
            "requires_disability": False,
            "requires_farmer": False,
            "priority_level": 2,
            "required_documents": "Aadhaar,Age_Proof,Medical_Prescription,Bank_Passbook"
        }
    ]

    schemes_df = pd.DataFrame(schemes_data)
    schemes_path = os.path.join(data_dir, "schemes.csv")
    schemes_df.to_csv(schemes_path, index=False)

    # -------------------------------------------------------------
    # 3. GENERATE APPLICATIONS — SYNTHETIC FRAUD V2 METHODOLOGY
    # -------------------------------------------------------------
    n_apps = 1150
    application_ids = [f"APP{10001 + i}" for i in range(n_apps)]

    citizen_lookup = citizens_df.set_index("citizen_id").to_dict("index")
    scheme_lookup = schemes_df.set_index("scheme_id").to_dict("index")

    citizen_ids_sample = np.random.choice(citizens_df["citizen_id"].values, size=n_apps)
    scheme_ids_sample = np.random.choice(schemes_df["scheme_id"].values, size=n_apps)
    dates = pd.date_range(start="2025-01-01", end="2026-06-30", periods=n_apps).strftime("%Y-%m-%d").tolist()

    # Track application history per citizen to compute real historical metrics
    citizen_history = {} # cid -> list of dicts: {"date": date_str, "scheme_id": sid}

    fraud_scenarios_pool = [
        "Income Suppression",
        "Land Inflation",
        "Identity Duplication",
        "Multiple Benefit Claims",
        "Document Irregularity",
        "Behavioral Pattern"
    ]
    fraud_scenario_weights = [0.25, 0.20, 0.20, 0.15, 0.10, 0.10]

    # Application record storage arrays
    declared_incomes = []
    declared_lands = []
    doc_counts = []
    statuses = []
    prev_apps = []
    dup_identity_flags = []
    income_mismatch_flags = []
    land_mismatch_flags = []
    multiple_scheme_flags = []
    fraud_labels = []

    # New observable features
    income_deviation_pcts = []
    land_deviation_pcts = []
    application_frequencies = []
    days_since_prev_apps = []
    scheme_claim_counts = []
    benefit_overlap_counts = []
    document_completenesses = []
    citizen_data_consistencies = []
    application_consistency_scores = []
    suspicious_pattern_scores = []
    assigned_scenarios = []

    for i in range(n_apps):
        cid = citizen_ids_sample[i]
        sid = scheme_ids_sample[i]
        app_date = dates[i]

        c_info = citizen_lookup[cid]
        s_info = scheme_lookup[sid]

        actual_income = float(c_info["annual_income"])
        actual_land = float(c_info["land_area"])

        req_docs_list = [d.strip() for d in str(s_info["required_documents"]).split(",") if d.strip()]
        req_doc_count = max(1, len(req_docs_list))

        # Compute real citizen application history metrics up to this application
        c_hist = citizen_history.get(cid, [])
        has_previous = len(c_hist) > 0
        app_freq = len(c_hist) + 1

        if has_previous:
            last_date = c_hist[-1]["date"]
            days_since_prev = max(0, (pd.to_datetime(app_date) - pd.to_datetime(last_date)).days)
        else:
            days_since_prev = -1

        applied_schemes = list(set([h["scheme_id"] for h in c_hist] + [sid]))
        scheme_claim_cnt = len(applied_schemes)

        # Benefit overlap count: count schemes applied with priority level <= 2
        overlap_cnt = sum(1 for sch_id in applied_schemes if scheme_lookup[sch_id]["priority_level"] <= 2)

        # Determine ground-truth scenario (~15% fraudulent)
        is_fraud = np.random.rand() < 0.15

        if is_fraud:
            scenario = np.random.choice(fraud_scenarios_pool, p=fraud_scenario_weights)
            fraud_label = 1
        else:
            scenario = "Normal Application"
            fraud_label = 0

        assigned_scenarios.append(scenario)

        # -------------------------------------------------------------
        # FEATURE GENERATION BASED ON SCENARIO + REALISTIC NOISE
        # -------------------------------------------------------------
        if scenario == "Income Suppression":
            # Under-declare income significantly
            declared_inc = int(actual_income * np.random.uniform(0.20, 0.55))
            declared_land = round(actual_land * np.random.uniform(0.96, 1.04), 2)
            doc_cnt = int(np.random.choice([1, 2, 3, 4], p=[0.2, 0.4, 0.3, 0.1]))

        elif scenario == "Land Inflation":
            declared_inc = int(actual_income * np.random.uniform(0.95, 1.05))
            declared_land = round(actual_land + float(np.random.uniform(2.5, 6.5)), 2)
            doc_cnt = int(np.random.choice([2, 3, 4], p=[0.3, 0.4, 0.3]))

        elif scenario == "Identity Duplication":
            declared_inc = int(actual_income * np.random.uniform(0.92, 1.08))
            declared_land = round(actual_land * np.random.uniform(0.95, 1.05), 2)
            if days_since_prev == -1 or days_since_prev > 5:
                days_since_prev = int(np.random.choice([0, 1, 2]))
            doc_cnt = int(np.random.choice([1, 2, 3], p=[0.4, 0.4, 0.2]))

        elif scenario == "Multiple Benefit Claims":
            declared_inc = int(actual_income * np.random.uniform(0.93, 1.07))
            declared_land = round(actual_land * np.random.uniform(0.95, 1.05), 2)
            scheme_claim_cnt += int(np.random.choice([2, 3]))
            overlap_cnt += int(np.random.choice([2, 3]))
            doc_cnt = int(np.random.choice([2, 3, 4], p=[0.3, 0.4, 0.3]))

        elif scenario == "Document Irregularity":
            declared_inc = int(actual_income * np.random.uniform(0.85, 1.15))
            declared_land = round(actual_land * np.random.uniform(0.90, 1.10), 2)
            doc_cnt = int(np.random.choice([1, 2], p=[0.65, 0.35]))

        elif scenario == "Behavioral Pattern":
            declared_inc = int(actual_income * np.random.uniform(0.88, 1.12))
            declared_land = round(actual_land * np.random.uniform(0.92, 1.08), 2)
            days_since_prev = int(np.random.choice([0, 1, 2, 3]))
            app_freq += int(np.random.choice([2, 3]))
            doc_cnt = int(np.random.choice([2, 3], p=[0.5, 0.5]))

        else: # Normal Application (with realistic minor noise)
            if np.random.rand() < 0.10: # 10% slight honest reporting variation
                declared_inc = int(actual_income * np.random.uniform(0.82, 1.18))
            else:
                declared_inc = int(actual_income * np.random.uniform(0.96, 1.04))

            if np.random.rand() < 0.10: # 10% minor land reporting variation
                declared_land = max(0.0, round(actual_land + float(np.random.uniform(-0.4, 0.4)), 2))
            else:
                declared_land = round(actual_land * np.random.uniform(0.97, 1.03), 2)

            doc_cnt = int(np.random.choice([3, 4, 5], p=[0.2, 0.5, 0.3]))

        # Keep values non-negative
        declared_inc = max(5000, declared_inc)
        declared_land = max(0.0, declared_land)

        # -------------------------------------------------------------
        # DERIVED OBSERVABLE METRICS & METRIC FORMULAS
        # -------------------------------------------------------------
        # 1. Income deviation %
        inc_dev_pct = round(abs(declared_inc - actual_income) / float(max(actual_income, 1.0)) * 100.0, 2)

        # 2. Land deviation %
        if actual_land > 0:
            land_dev_pct = round(abs(declared_land - actual_land) / float(actual_land) * 100.0, 2)
        else:
            land_dev_pct = round(declared_land * 100.0, 2) if declared_land > 0 else 0.0

        # 3. Document completeness ratio
        doc_completeness = round(min(1.0, doc_cnt / float(req_doc_count)), 2)

        # 4. Citizen data consistency (0-100 score)
        c_cons = 100.0 - min(45.0, inc_dev_pct * 0.45) - min(45.0, land_dev_pct * 0.45)
        c_cons += float(np.random.uniform(-2.0, 2.0))
        citizen_data_consistency = round(max(0.0, min(100.0, c_cons)), 2)

        # 5. Application consistency score (0-100 score)
        a_cons = (doc_completeness * 60.0)
        if days_since_prev >= 0 and days_since_prev <= 3:
            a_cons += 10.0
        elif days_since_prev > 3 or days_since_prev == -1:
            a_cons += 40.0
        a_cons += float(np.random.uniform(-3.0, 3.0))
        application_consistency_score = round(max(0.0, min(100.0, a_cons)), 2)

        # 6. Aggregate suspicious pattern score (0-100 score with noise - NOT direct copy of fraud_label)
        raw_susp = (
            min(35.0, inc_dev_pct * 0.4) +
            min(30.0, land_dev_pct * 0.3) +
            (25.0 if doc_completeness < 0.6 else 0.0) +
            (20.0 if (days_since_prev >= 0 and days_since_prev <= 3) else 0.0) +
            (15.0 if scheme_claim_cnt > 2 else 0.0)
        )
        # Add random noise to decouple score from deterministic label separability
        raw_susp += float(np.random.normal(0.0, 4.0))
        suspicious_pattern_score = int(np.round(max(0.0, min(100.0, raw_susp))))

        # -------------------------------------------------------------
        # DERIVED BACKWARD-COMPATIBLE OBSERVABLE FLAGS
        # -------------------------------------------------------------
        income_mismatch_flag = 1 if inc_dev_pct > 30.0 else 0
        land_mismatch_flag = 1 if (land_dev_pct > 35.0 or abs(declared_land - actual_land) > 1.5) else 0
        dup_identity_flag = 1 if (scenario == "Identity Duplication" or (days_since_prev >= 0 and days_since_prev <= 2 and np.random.rand() < 0.75)) else 0
        multiple_scheme_flag = 1 if (scheme_claim_cnt > 2 or overlap_cnt > 1) else 0

        # Status assignment based on suspicious score
        if suspicious_pattern_score >= 60:
            st = np.random.choice(["Under Review", "Rejected"], p=[0.45, 0.55])
        else:
            st = np.random.choice(["Submitted", "Under Review", "Approved"], p=[0.35, 0.30, 0.35])

        # Append to record lists
        declared_incomes.append(declared_inc)
        declared_lands.append(declared_land)
        doc_counts.append(doc_cnt)
        statuses.append(st)
        prev_apps.append(has_previous)
        dup_identity_flags.append(dup_identity_flag)
        income_mismatch_flags.append(income_mismatch_flag)
        land_mismatch_flags.append(land_mismatch_flag)
        multiple_scheme_flags.append(multiple_scheme_flag)
        fraud_labels.append(fraud_label)

        # New features
        income_deviation_pcts.append(inc_dev_pct)
        land_deviation_pcts.append(land_dev_pct)
        application_frequencies.append(app_freq)
        days_since_prev_apps.append(days_since_prev)
        scheme_claim_counts.append(scheme_claim_cnt)
        benefit_overlap_counts.append(overlap_cnt)
        document_completenesses.append(doc_completeness)
        citizen_data_consistencies.append(citizen_data_consistency)
        application_consistency_scores.append(application_consistency_score)
        suspicious_pattern_scores.append(suspicious_pattern_score)

        # Update history
        c_hist.append({"date": app_date, "scheme_id": sid})
        citizen_history[cid] = c_hist

    apps_df = pd.DataFrame({
        "application_id": application_ids,
        "citizen_id": citizen_ids_sample,
        "scheme_id": scheme_ids_sample,
        "application_date": dates,
        "declared_income": declared_incomes,
        "declared_land_area": declared_lands,
        "document_count": doc_counts,
        "application_status": statuses,
        "previous_application": prev_apps,
        "duplicate_identity_flag": dup_identity_flags,
        "income_mismatch_flag": income_mismatch_flags,
        "land_mismatch_flag": land_mismatch_flags,
        "multiple_scheme_flag": multiple_scheme_flags,
        "fraud_label": fraud_labels,
        "income_deviation_pct": income_deviation_pcts,
        "land_deviation_pct": land_deviation_pcts,
        "application_frequency": application_frequencies,
        "days_since_previous_application": days_since_prev_apps,
        "scheme_claim_count": scheme_claim_counts,
        "benefit_overlap_count": benefit_overlap_counts,
        "document_completeness": document_completenesses,
        "citizen_data_consistency": citizen_data_consistencies,
        "application_consistency_score": application_consistency_scores,
        "suspicious_pattern_score": suspicious_pattern_scores
    })

    apps_path = os.path.join(data_dir, "applications.csv")
    apps_df.to_csv(apps_path, index=False)

    # -------------------------------------------------------------
    # PRINT REQUIRED OUTPUT STATISTICS
    # -------------------------------------------------------------
    n_fraud = int(apps_df["fraud_label"].sum())
    fraud_pct = (n_fraud / float(n_apps)) * 100.0

    scenario_counts = pd.Series(assigned_scenarios).value_counts().to_dict()

    print("\n==========================================================================")
    print("        SYNTHETIC FRAUD DATASET V2 GENERATION SUMMARY                     ")
    print("==========================================================================")
    print(f"Number of citizens              : {len(citizens_df)}")
    print(f"Number of schemes               : {len(schemes_df)}")
    print(f"Number of applications          : {len(apps_df)}")
    print(f"Number of fraudulent applications: {n_fraud}")
    print(f"Fraud percentage                : {fraud_pct:.2f}%")
    print("\nDistribution of Fraud Scenarios:")
    for sc, count in scenario_counts.items():
        print(f"  - {sc:<25}: {count} records ({count / float(n_apps) * 100.0:.2f}%)")

    print("\nFirst 5 Application Records:")
    pd.set_option("display.max_columns", 15)
    pd.set_option("display.width", 1000)
    print(apps_df.head(5).to_string(index=False))

    print("\nSynthetic fraud dataset V2 generated successfully.")

if __name__ == "__main__":
    generate_synthetic_datasets()
