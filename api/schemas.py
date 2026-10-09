from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class CitizenInput(BaseModel):
    citizen_id: str = Field(default="CIT_UNKNOWN", description="Unique Identifier of the Citizen")
    age: int = Field(default=35, ge=0, le=120, description="Age of the citizen")
    gender: str = Field(default="MALE", description="Gender of the citizen")
    annual_income: float = Field(default=150000.0, ge=0.0, description="Annual Income in INR")
    occupation: str = Field(default="Agriculture", description="Occupation details")
    land_area: float = Field(default=1.5, ge=0.0, description="Land area holding in acres")
    family_size: int = Field(default=4, ge=1, description="Size of the family")
    education_level: str = Field(default="Secondary", description="Highest education level")
    disability_status: bool = Field(default=False, description="Disability status indicator")
    marital_status: str = Field(default="Married", description="Marital status")
    employment_status: str = Field(default="Self-Employed", description="Employment status")
    village: str = Field(default="Rural District", description="Name of the village")
    existing_scheme_count: int = Field(default=0, ge=0, description="Active government schemes currently claimed")
    bank_account: bool = Field(default=True, description="Indicates if bank account exists")
    ration_card: str = Field(default="BPL", description="Ration card type")
    aadhaar_verified: bool = Field(default=True, description="Aadhaar validation check status")
    housing_condition: str = Field(default="Kutcha", description="Housing structure category")
    health_condition: str = Field(default="Good", description="General health condition")
    farmer_status: bool = Field(default=True, description="Farmer status indicator")
    senior_citizen: bool = Field(default=False, description="Senior citizen indicator")
    previous_benefit_received: bool = Field(default=False, description="Indicator of any prior benefits received")

class ApplicationInput(BaseModel):
    application_id: str = Field(..., description="Unique Application Transaction ID")
    citizen_id: str = Field(..., description="ID of applying citizen")
    scheme_id: str = Field(..., description="Target welfare scheme ID")
    declared_income: float = Field(..., ge=0.0, description="Declared annual income")
    declared_land_area: float = Field(..., ge=0.0, description="Declared land area in acres")
    document_count: int = Field(..., ge=0, description="Count of uploaded validation documents")
    application_date: str = Field(..., description="Date of submission")
    
    # Optional history/derived features to support dynamic/test scenarios
    application_status: Optional[str] = None
    previous_application: Optional[bool] = None
    duplicate_identity_flag: Optional[int] = None
    income_mismatch_flag: Optional[int] = None
    land_mismatch_flag: Optional[int] = None
    multiple_scheme_flag: Optional[int] = None
    income_deviation_pct: Optional[float] = None
    land_deviation_pct: Optional[float] = None
    application_frequency: Optional[int] = None
    days_since_previous_application: Optional[int] = None
    scheme_claim_count: Optional[int] = None
    benefit_overlap_count: Optional[int] = None
    document_completeness: Optional[float] = None
    citizen_data_consistency: Optional[float] = None
    application_consistency_score: Optional[float] = None
    suspicious_pattern_score: Optional[int] = None

class AnalyzeRequest(BaseModel):
    citizen: CitizenInput
    application: ApplicationInput

class ProfileOutput(BaseModel):
    citizen_id: str
    age_group: str
    income_category: str
    occupation_category: str
    land_category: str
    family_category: str
    vulnerability_score: float
    document_readiness: float
    aadhaar_verified: bool
    bank_account: bool
    farmer_indicator: bool
    senior_citizen_indicator: bool

class RecommendationItem(BaseModel):
    scheme_id: str
    scheme_name: str
    eligible: bool
    score: int
    reasons: List[str]
    missing_documents: List[str]

class FraudAnalysisOutput(BaseModel):
    prediction: str
    fraud_probability: float
    risk_level: str
    verification_requirement: str

class ShapFactorItem(BaseModel):
    feature: str
    observed_value: float
    shap_value: float
    impact: str
    explanation: str

class ExplanationOutput(BaseModel):
    top_factors: List[ShapFactorItem]
    human_readable_explanation: str

class AnalyzeResponse(BaseModel):
    citizen_id: str
    application_id: str
    profile: ProfileOutput
    recommendations: List[RecommendationItem]
    fraud_analysis: FraudAnalysisOutput
    explanation: ExplanationOutput
    final_status: str = "PENDING OFFICER REVIEW"
    officer_decision_required: bool = True
