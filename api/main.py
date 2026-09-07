import os
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from api.schemas import AnalyzeRequest, AnalyzeResponse
from api.service import AIService

# Load environment configuration
load_dotenv()

app = FastAPI(
    title="UCMS AI Service",
    description="FastAPI Service exposing Machine Learning and Explainable AI pipelines for the Unified Citizen Management System (UCMS).",
    version="1.0.0"
)

# CORS Configuration
origins_str = os.getenv("ALLOWED_ORIGINS", "http://localhost:8080,http://localhost:3000,http://localhost:5173")
origins = [org.strip() for org in origins_str.split(",") if org.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Instantiate the service
try:
    service = AIService()
except Exception as e:
    print(f"Warning: Failed to instantiate AIService. Core engines might be missing: {e}")
    service = None

@app.get("/health", status_code=status.HTTP_200_OK)
def health():
    """
    Exposes health telemetry check and confirms model status.
    """
    model_loaded = False
    if service is not None and service.fraud_engine is not None:
         model_loaded = service.fraud_engine.model is not None
         
    return {
        "status": "UP",
        "service": "UCMS AI Service",
        "model_loaded": model_loaded
    }

@app.post("/api/v1/ai/analyze", response_model=AnalyzeResponse, status_code=status.HTTP_200_OK)
def analyze(request: AnalyzeRequest):
    """
    Performs profile target matching, welfare scheme scoring recommendations,
    fraud classifier predictions, and dynamic local SHAP attributions.
    """
    if service is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="UCMS AI Service is not fully initialized. Model load failure."
        )

    try:
        citizen_dict = request.citizen.dict()
        app_dict = request.application.dict()
        
        # Verify alignment of identifiers
        if citizen_dict["citizen_id"] != app_dict["citizen_id"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Identifier Mismatch: citizen_id in citizen profile must match citizen_id in application request."
            )
            
        result = service.analyze(citizen_dict, app_dict)
        return result
        
    except HTTPException as he:
        raise he
    except ValueError as ve:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid Request Attributes: {str(ve)}"
        )
    except Exception as e:
        import traceback
        traceback.print_exc()
        # Prevent exposing raw internal python stack traces to clients
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred during AI evaluation: {str(e)}"
        )

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("AI_PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
