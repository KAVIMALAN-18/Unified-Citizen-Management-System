# Unified Citizen Management System (UCMS) for Village Administration
## AI & Novelty Module Prototype

> **Legal Disclaimer & Patent Investigation Notice:**  
> Potential novelty is being investigated and must be validated through prior-art search and professional patent examination. This prototype utilizes synthetic mock data created solely for academic and technical demonstration purposes.

---

## 1. Project Purpose
The **Unified Citizen Management System (UCMS)** is designed to modernize village administration and rural governance through automated, explainable, and fair AI decision support. Traditional welfare distribution in village administration often suffers from manual processing delays, difficulty matching citizens to relevant government schemes, and risk of fraudulent applications.

This AI module prototyped in Python addresses these administrative bottlenecks through four core AI novelty components operating on synthetic demographic and application data.

---

## 2. AI Novelty Components
The prototype implements four modular AI/data-driven intelligence engines:
1. **Citizen Profile Analyzer:** Feature enrichment engine deriving vulnerability indices, socio-economic categories, and document readiness metrics.
2. **Dynamic Scheme Recommendation Engine:** Multi-factor scoring model (0–100) evaluating age suitability, financial need ratio, vulnerability weight, document readiness, and equity of benefit distribution.
3. **Fraud Intelligence Engine:** Rule-based anomaly detection engine identifying duplicate identities, income/land discrepancies, and multi-scheme over-claiming.
4. **Explainable AI (XAI) Layer:** Transparent decision interpretation layer translating scores into actionable audit trails for village administrators.

---

## 3. Architecture
```
                                 [ Synthetic Village Data ]
                                 (citizens, schemes, apps)
                                             │
                                             ▼
                               ┌───────────────────────────┐
                               │ Citizen Profile Analyzer  │
                               └─────────────┬─────────────┘
                                             │ Enriched Profile
                                             ▼
                               ┌───────────────────────────┐
                               │  Recommendation Engine    │
                               └─────────────┬─────────────┘
                                             │ Scored & Ranked Schemes
                                             ▼
                               ┌───────────────────────────┐
                               │ Fraud Intelligence Engine │
                               └─────────────┬─────────────┘
                                             │ Risk Score & Flags
                                             ▼
                               ┌───────────────────────────┐
                               │  Explainable AI Layer     │
                               └─────────────┬─────────────┘
                                             │
                                             ▼
                                  [ Final AI Audit Report ]
```

---

## 4. Dataset Description (Synthetic Demo Data)
All datasets are programmatically generated using reproducible fixed random seeds (`seed=42`).
- **`data/citizens.csv`**: ~500 synthetic citizens with demographic attributes (age, income, occupation, land holding, family size, disability status, housing condition, ration card type, Aadhaar verification).
- **`data/schemes.csv`**: 12 synthetic government welfare schemes with eligibility constraints and document requirements.
- **`data/applications.csv`**: ~1,150 synthetic scheme applications including synthetic ground-truth fraud labels and anomaly flags.

---

## 5. Citizen Profile Analyzer (`src/citizenProfileAnalyzer.py`)
Converts raw administrative rows into analytical indicators:
- **Age Grouping:** `Youth`, `Middle-Aged`, `Senior Citizen`
- **Income Categorization:** `Ultra Low`, `Low`, `Middle`, `Higher`
- **Vulnerability Score (0–100):** Multi-factor composite of housing quality, income bracket, disability status, and ration card priority.
- **Document Readiness (0–100%):** Quantitative readiness score based on verified credentials.

---

## 6. Recommendation Engine (`src/recommendationEngine.py`)
Replaces basic `if-else` conditionals with a modular multi-factor scoring algorithm:
$$\text{Score} = \text{Base Eligibility} + \text{Income Need} + \text{Vulnerability Boost} + \text{Doc Readiness} + \text{Equity Balance}$$
Normalizes final scores between 0–100 and yields ranked lists of eligible schemes alongside specific missing documentation lists.

---

## 7. Fraud Intelligence Engine (`src/fraudEngine.py`)
Analyzes applications for suspicious patterns across 5 primary indicators:
1. Duplicate Identity Marker (`duplicate_identity_flag`)
2. Income Discrepancy (Declared vs Verified Profile Income)
3. Land Area Deviation (Declared vs Revenue Records)
4. Multiple Concurrent Scheme Over-claiming
5. Severely Deficient Documentation

Risk Categories:
- **0–30:** LOW RISK
- **31–60:** MEDIUM RISK
- **61–100:** HIGH RISK

---

## 8. Explainable AI Layer (`src/explainableAI.py`)
Generates clear human-readable explanations detailing *why* a recommendation was made or *why* an application was flagged as high-risk. Prepared for integration with SHAP feature attribution values for machine learning classifiers.

---

## 9. ML Baseline Model (`src/train.py`)
Includes an interpretable `DecisionTreeClassifier` baseline model trained on synthetic feature vectors to classify fraudulent application patterns. Trained artifacts are saved into `models/fraud_model.joblib`.

---

## 10. Model Evaluation (`src/evaluate.py`)
Provides quantitative evaluation metrics on synthetic datasets:
- **Fraud Classifier:** Accuracy, Precision, Recall, F1-Score, Confusion Matrix.
- **Recommendation Engine:** Rule-consistency verification against synthetic ground-truth eligibility parameters.

---

## 11. Synthetic Data Disclaimer
> **IMPORTANT NOTICE:**  
> All data used in this project (citizens, schemes, applications, and fraud labels) is synthetically generated mock data created solely for prototyping and technical evaluation. It does not represent real individuals, live government records, or actual administrative performance.

---

## 12. How to Run the Project

### Prerequisites
Activate the pre-existing virtual environment:
```powershell
.\venv\Scripts\Activate.ps1
```

### 1. Verify Environment & Imports
```powershell
python -c "import pandas, numpy, sklearn, matplotlib, seaborn, shap; print('Environment verified successfully')"
```

### 2. Generate Synthetic Datasets
```powershell
python src/generate_data.py
```

### 3. Run End-to-End AI Pipeline (Main Entry Point)
```powershell
python src/main.py
```
*(Optionally pass a specific citizen ID: `python src/main.py CIT10001`)*

### 4. Train the ML Fraud Baseline Model
```powershell
python src/train.py
```

### 5. Run Evaluation Metrics
```powershell
python src/evaluate.py
```
