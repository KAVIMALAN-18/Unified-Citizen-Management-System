# Unified Citizen Management System (UCMS) for Village Administration

A digital, automated, and explainable AI decision-support platform designed to modernize rural governance. The system streamlines welfare distribution, scheme suggestions, official certificate requests, citizen grievances, public works, and budget transparency through a robust multi-tiered stack.

---

## 🚀 System Architecture Overview

The system is organized into three decoupled, high-performance tiers communicating via secure HTTP REST endpoints, backed by a cloud-hosted relational database:

```
                  ┌──────────────────────────────┐
                  │   Citizen & Officer Portal   │
                  │     (React 19 + Vite)        │
                  └──────────────┬───────────────┘
                                 │
                     HTTP REST   │ (JWT Authenticated)
                                 ▼
                  ┌──────────────────────────────┐
                  │   Core Transaction Backend   │
                  │   (Spring Boot 3 + JPA)      │
                  └──────────────┬───────┬───────┘
                                 │       │
             Neon PostgreSQL     │       │ HTTP REST API
             Cloud Database      │       │ (Analyze Payload)
                                 ▼       ▼
                       ┌───────────┐   ┌───────────────────────────┐
                       │ Database  │   │  Explainable AI Service   │
                       │  Instance │   │    (FastAPI + Python)     │
                       └───────────┘   └───────────────────────────┘
```

1. **Frontend Portal (React 19 + Vite)**: A responsive single-page web app styled with premium vanilla CSS. It contains two isolated user dashboards: the **Citizen Portal** and the **Officer Portal**.
2. **Core Transaction Backend (Spring Boot 3 + Spring Data JPA)**: Provides transactional business services, state persistency, and a Spring Security authentication layer (using BCrypt hashing and JWT authorization).
3. **Explainable AI Service (FastAPI + Python)**: Orchestrates quantitative citizen profiling, welfare scheme scoring, Random Forest-based fraud risk prediction, and SHAP (SHapley Additive exPlanations) decision transparency.

---

## 🔑 Key Features & Modules

### 👤 1. Citizen Portal
*   **Secure Authentication**: Self-registration with detailed socio-economic fields (income, land area, farmer status, ration card priority). Login returns an HTTP JWT token stored client-side.
*   **Dashboard & Alerts**: At-a-glance status metrics on active applications, notifications for certificate approvals, and an interactive sidebar.
*   **AI Scheme Recommender**: Displays eligible government programs (e.g., *Farmer Subsidy*, *Pension Scheme*, *Housing Scheme*) ranked by a dynamic compatibility index.
*   **Certificate Request Desk**: Allows digital requests for Birth, Income, Community, and Residence certificates, including real-time status badges and printable verified certificates.
*   **Civic Feedback Desk**: Submit, update, and track status actions on local infrastructure grievances or village panchayat development suggestions.

### 👮 2. Officer (Administrative) Portal
*   **Overview Board**: Counters tracking total pending applications, outstanding grievances, unclaimed certificates, and flagged fraud risks.
*   **AI-Assisted Scheme Auditing**: Trigger FastAPI AI evaluations on applications. Displays validation checklists (e.g., declared vs. verified income, revenue land surveys).
*   **Explainable AI & SHAP Visualizations**: Renders a local interactive breakdown showing precisely which demographic features shifted the fraud probability gauge.
*   **Demographic Analytics**: Dynamic visual charts summarizing village population age brackets, ration cards, farmer percentages, and poverty indices.
*   **Public Works & Budget Tracker**: Configures infrastructure projects, tracks real-time progress percentages, and publishes annual financial allocations.

### 🤖 3. Core AI Engines
*   **Citizen Profile Analyzer**: Extracts socio-economic category labels and builds standard vulnerability indicators.
*   **Recommendation Engine**: Uses multi-factor scoring matching eligible criteria, deducting scores for missing documentation, and adjusting for equity distribution.
*   **Fraud Intelligence Engine**: Checks criteria inconsistencies and runs a machine learning classifier to detect synthetic fraud labels.
*   **Explainable AI (XAI) Layer**: Converts ML weights into human-readable text and provides feature attributions utilizing SHAP.

---

## 📁 Project Directory Structure

```
Unified Citizen Management System/
├── api/                    # FastAPI AI Service
│   ├── main.py             # Server endpoints & entrypoint
│   ├── schemas.py          # Pydantic input/output schemas
│   └── service.py          # AI Orchestration Service
├── backend/                # Spring Boot REST Transactional Backend
│   ├── src/main/java/      # MVC controllers, JPA repositories, security modules
│   └── pom.xml             # Spring Boot Maven dependencies
├── frontend/               # React 19 Frontend
│   ├── src/                # Pages (Citizen/Officer/Auth), Components, Layouts
│   └── package.json        # Frontend configuration & scripts
├── src/                    # Underlying Python AI Core Pipelines
│   ├── citizenProfileAnalyzer.py
│   ├── recommendationEngine.py
│   ├── fraudEngine.py
│   ├── explainableAI.py
│   ├── generate_data.py    # Programmatic synthetic data generator
│   ├── train.py            # Baseline Random Forest classifier training
│   └── evaluate.py         # Evaluation reports for ML baseline model
├── data/                   # Generated Synthetic CSV Datasets
├── models/                 # Saved trained model joblibs and diagnostic PNGs
└── requirements.txt        # Python pip dependencies
```

---

## ⚙️ Setting Up and Running the System

### Prerequisites
*   **Java**: JDK 21 LTS installed.
*   **Python**: Python 3.10+ installed.
*   **Node.js**: Node 18+ and npm installed.
*   **Database**: A PostgreSQL database (local or cloud-hosted instance like Neon).

---

### Step 1: Python AI Service Setup

1. Open a PowerShell terminal and navigate to the project root directory.
2. Initialize and activate the Python virtual environment:
   ```powershell
   python -m venv venv
   .\venv\Scripts\Activate.ps1
   ```
3. Install required packages:
   ```powershell
   pip install -r requirements.txt
   ```
4. Generate the synthetic datasets:
   ```powershell
   python src/generate_data.py
   ```
5. Train the baseline Random Forest classifier model:
   ```powershell
   python src/train.py
   ```
6. Run the FastAPI server:
   ```powershell
   uvicorn api.main:app --host 0.0.0.0 --port 8000 --reload
   ```
   *Verify FastAPI status by opening `http://localhost:8000/health` in your browser.*

---

### Step 2: Spring Boot Backend Setup

1. Navigate to the `backend/` directory.
2. Set up the local `.env` environment variables or pass them dynamically:
   *   `DB_URL`: JDBC database path (e.g. `jdbc:postgresql://<host>:5432/<dbname>?sslmode=require`)
   *   `DB_USERNAME`: Database login username
   *   `DB_PASSWORD`: Database login password
   *   `JWT_SECRET`: Signing token passphrase (at least 32 characters)
   *   `AI_SERVICE_URL`: URL of the running FastAPI server (`http://localhost:8000`)
3. Compile, run tests, and spin up the backend:
   ```powershell
   # On Windows PowerShell
   $env:DB_URL="jdbc:postgresql://your-db-host:5432/neondb?sslmode=require"
   $env:DB_USERNAME="your-db-username"
   $env:DB_PASSWORD="your-db-password"
   $env:JWT_SECRET="yourSuperSecretKeyAtLeastThirtyTwoCharsLong!"
   $env:AI_SERVICE_URL="http://localhost:8000"
   mvn spring-boot:run
   ```
   *The backend will run on `http://localhost:8080`.*

---

### Step 3: React Frontend Setup

1. Navigate to the `frontend/` directory.
2. Install npm modules:
   ```powershell
   npm install
   ```
3. Start the Vite dev server:
   ```powershell
   npm run dev
   ```
4. Open your browser and navigate to `http://localhost:5173`.

---

## 📡 API Integration Contracts

### FastAPI Analysis Request Schema
*   **Route**: `POST /api/v1/ai/analyze`
*   **Body (`application/json`)**:
```json
{
  "citizen": {
    "citizen_id": "CIT10001",
    "age": 42,
    "annual_income": 45000.0,
    "land_area": 1.2,
    "farmer_status": true,
    "occupation": "Agriculture",
    "family_size": 4,
    "disability_status": false,
    "housing_condition": "Pucca",
    "ration_card_type": "PHH",
    "aadhaar_verified": true,
    "bank_account_verified": true
  },
  "application": {
    "application_id": "APP50012",
    "citizen_id": "CIT10001",
    "scheme_id": "SCH_FARM_SUB",
    "declared_income": 45000.0,
    "declared_land": 1.2,
    "has_discrepancies": false,
    "submitted_documents": ["Aadhaar Card", "Land Deed", "Farmer ID"]
  }
}
```

### FastAPI Analysis Response Schema
```json
{
  "citizen_id": "CIT10001",
  "application_id": "APP50012",
  "profile": {
    "citizen_id": "CIT10001",
    "age_group": "Middle-Aged",
    "income_category": "Low",
    "vulnerability_score": 45.0,
    "document_readiness": 100.0,
    "aadhaar_verified": true,
    "farmer_indicator": true
  },
  "recommendations": [
    {
      "scheme_id": "SCH_FARM_SUB",
      "scheme_name": "PM Kisan Samman Nidhi (Farmer Subsidy)",
      "eligible": true,
      "score": 92.5,
      "reasons": ["Meets farmer requirements", "Matches income thresholds"],
      "missing_documents": []
    }
  ],
  "fraud_analysis": {
    "prediction": "NORMAL",
    "fraud_probability": 0.08,
    "risk_level": "LOW",
    "verification_requirement": "Standard Verification"
  },
  "explanation": {
    "top_factors": [
      {
        "feature": "declared_income",
        "observed_value": 45000.0,
        "shap_value": -0.15,
        "impact": "DECREASED_RISK",
        "explanation": "Declared income matches profile data and falls within low-income threshold."
      }
    ],
    "human_readable_explanation": "Application shows low-risk characteristics. Profile attributes align with historical normal records."
  },
  "final_status": "PENDING OFFICER REVIEW",
  "officer_decision_required": true
}
```

---

## ⚖️ License & Disclaimers
*   **Mock Data Disclaimer**: All citizen registries, scheme matrices, verification checks, and applications are mock synthetics generated strictly for prototyping.
*   **Novelty Notice**: AI features (Vulnerability Scoring index, SHAP decision-attributions) are prototype proofs of concept and do not constitute legal panchayat policy recommendations.
