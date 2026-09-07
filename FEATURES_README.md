# Unified Citizen Management System (UCMS) - Implemented Features Guide

This document provides a comprehensive breakdown of all features, services, and modules developed across the Unified Citizen Management System (UCMS). The system is built to digitize, automate, and bring transparency and AI decision-support to local village administrations.

---

## 🚀 System Architecture Overview
The system is divided into three primary tiers:
1.  **Frontend Portal (React 19 + Vite)**: A responsive single-page application split into a **Citizen Portal** and an **Officer Portal**.
2.  **Core Transaction Backend (Spring Boot 3 + JPA)**: Handles REST endpoints, relational databases, security configurations (JWT + BCrypt), and bridges the AI service.
3.  **Explainable AI Service (FastAPI + Python)**: Computes dynamic vulnerability indexes, scheme recommendations, and evaluates application fraud risks using Machine Learning coupled with SHAP (SHapley Additive exPlanations) attributions.

---

## 🔑 Authentication & Access Control

*   **Citizen Access Layer**:
    *   **Registration**: Captures standard contact details along with demographic and socio-economic variables (annual income, land area holdings, farmer status, housing quality index, ration card classification, and Aadhaar verification).
    *   **Login**: Secures identity verification with BCrypt hashing and outputs JSON Web Tokens (JWT) stored client-side.
*   **Officer Access Layer**:
    *   **Administrative Login**: Restricts entry to verified officers utilizing predefined server-side administrative credentials.
    *   **Protected Routes**: Router guards prevent citizens from viewing admin modules and vice-versa, redirecting unauthorized traffic dynamically based on token roles (`ROLE_CITIZEN` or `ROLE_OFFICER`).

---

## 👤 1. Citizen Portal Features

The Citizen Portal is designed to serve as a one-stop-shop for local government services, benefits tracking, and civic engagements.

### 📋 A. Dashboard & Navigation
*   **Overview Stats**: Displays active application status cards (Pending, Under Review, Approved, Rejected) and pending tasks.
*   **Notification Bar**: Provides quick alerts regarding status updates or certificate approvals.
*   **Interactive Sidebar**: Clean navigation to jump between pages (Dashboard, Schemes, Applications, Certificates, Grievances, Suggestions, and Profile).

### 🌾 B. Dynamic Schemes & AI Recommendations
*   **AI Scheme Recommender**: Scores and lists eligible government schemes (e.g., *Farmer Subsidy, Pension Scheme, Housing Scheme*) sorted by compatibility.
*   **Detailed Eligibility Guidelines**: Renders age constraints, income criteria, document checklists, and benefits.
*   **Application Engine**: An interface to apply for a scheme by declaring verified parameters and uploading required credentials.

### 📄 C. Certificate Applications
*   **Official Request Portal**: Enables citizens to request official documents:
    *   Income Certificate
    *   Birth Certificate
    *   Community Certificate
    *   Residence Certificate
*   **Downloadable Badges**: Displays status badges (e.g. `PENDING`, `APPROVED`, `REJECTED`) and auto-generates certificate reference codes upon officer approval.

### 💬 D. Civic Feedback & Grievances
*   **Grievances Desk**: A dedicated interface to submit local complaints (e.g., sanitation, road repairs) and track administrative action logs.
*   **Suggestions Board**: Allows citizens to submit proposals for infrastructure or social changes to the panchayat.

---

## 👮 2. Officer (Administrative) Portal Features

The Officer Portal equips village administrators with audit utilities, demographic analysis boards, and project management workspaces.

### 🛡️ A. Administrative Dashboard
*   **Admin Indicators**: High-level counters tracking total applications, open grievances, outstanding certificates, and pending fraud flags.
*   **Actionable Queue**: Lists recently submitted applications requiring immediate officer or AI-assisted auditing.

### 🕵️ B. AI-Assisted Scheme Auditing (The Core Novelty)
*   **FastAPI Integration Bridge**: Officers can trigger the Python AI pipeline on any pending application.
*   **Rule-Based Checks**: Instantly flags database mismatches (e.g., declared income vs. verified profile income, or declared land vs. registered survey maps).
*   **Machine Learning Classifier**: Evaluates fraud probability scores utilizing a trained Random Forest model.
*   **SHAP Force Visualizer**: Renders custom SHapley interactive charts displaying which specific attributes shifted the fraud risk index (e.g., extreme land discrepancies push the risk meter to Red).
*   **Review Panel**: Allows officers to input official remarks and override/approve/reject the status.

### 📈 C. Village Demographics & Analytics
*   **Village Dashboard**: Renders visual distribution charts mapping:
    *   Population classification by age brackets.
    *   Ration card distributions (PHH, NPHH, AAY).
    *   Percentage of verified farmers.
    *   Vulnerability distributions across families.

### 🏗️ D. Public Works & Budget Transparency
*   **Development Works Tracker**: Manages local infrastructure projects showing project names, budgets allocated, timeline status, and visual percentage progress sliders.
*   **Budget Console**: Allows officers to post annual budgets, track expenditures, and detail public project allocations.

---

## 🤖 3. Developed AI & Backend Services

Under the hood, the following background microservices and logic modules have been deployed:

### A. AI Core Engines (Python)
*   `CitizenProfileAnalyzer`: Formulates socio-economic vulnerability indexes and rates household quality parameters.
*   `RecommendationEngine`: Computes multi-factor utility scores combining eligibility rules, missing document penalties, and social equity metrics.
*   `FraudIntelligenceEngine`: Cross-checks multi-scheme overclaiming, duplicate registration entries, and data discrepancies.
*   `ExplainableAILayer`: Uses the SHAP package to decompose classifier outputs into directional feature contribution vectors.

### B. Core Endpoints (Spring Boot Java)
*   `AuthController`: Registration & Login handling.
*   `OfficerController`: Handles admin verification reviews, triggers FastAPI analysis loops, and reads/writes budget records.
*   `ApplicationController` / `CertificateController`: Handles submissions, document linkages, and approval triggers.
*   `GrievanceController` / `SuggestionController`: Citizen submission pipelines.
