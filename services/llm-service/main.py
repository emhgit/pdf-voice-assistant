import json
import os
from typing import List, Dict, Any
import ollama
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title="LLM Service", description="AI PDF Assistant LLM Microservice")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure this properly for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ExtractionRequest(BaseModel):
    transcription: str
    pdf_field_names: List[str]

class ExtractionResponse(BaseModel):
    extracted_fields: Dict[str, str]

def load_prompt_template() -> str:
    """Load the prompt template from file."""
    prompt_path = os.path.join(os.path.dirname(__file__), "prompts", "extract_fields.txt")
    try:
        with open(prompt_path, "r", encoding="utf-8") as f:
            return f.read().strip()
    except FileNotFoundError:
        # Fallback to inline prompt if file not found
        return """Extract structured data from the following transcription to fill out a PDF form.
Return ONLY a JSON object where each key is a PDF field name and the value is the extracted data.
Use this format: {{"field_name": "value"}}.

Transcription: "{transcription}"

PDF Field Names: {pdf_field_names}

Rules:
- Ignore irrelevant or repeated information.
- Match values to the closest field name semantically.
- Return empty ("") for unmatched fields."""

def call_llm(transcription: str, pdf_field_names: List[str]) -> Dict[str, str]:
    """Call the LLM to extract structured data from transcription."""
    prompt_template = load_prompt_template()
    
    # Format the prompt with the provided data
    prompt = prompt_template.format(
        transcription=transcription,
        pdf_field_names=pdf_field_names
    )
    
    try:
        response = ollama.generate(
            model="mistral",
            prompt=prompt,
            format="json",
            options={"temperature": 0.1}  # Reduce randomness for structured output
        )
        
        # Parse the JSON response
        response_text = response.get("response", "{}")
        print(f"Raw LLM response: {response_text}")  # Add logging

        # Clean the response (remove markdown code blocks if present)
        response_text = response_text.strip().replace('```json', '').replace('```', '').strip()

        try:
            extracted_data = json.loads(response_text)
            # Ensure all field names are present in the response
            result = {}
            for field_name in pdf_field_names:
                # Handle case where field name might be in different case
                matching_key = next(
                    (key for key in extracted_data.keys() if key.lower() == field_name.lower()),
                    field_name
                )
                result[field_name] = extracted_data.get(matching_key, "")
            return result
        except json.JSONDecodeError:
            raise HTTPException(
                status_code=500,
                detail=f"Invalid JSON response from LLM: {response_text}. Error: {str(e)}"
            )
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"LLM error: {str(e)}")

@app.get("/")
async def root():
    """Health check endpoint."""
    return {"message": "LLM Service is running", "status": "healthy"}

@app.post("/extract", response_model=ExtractionResponse)
async def extract_fields(request: ExtractionRequest):
    """Extract structured data from transcription using LLM."""
    try:
        extracted_fields = call_llm(request.transcription, request.pdf_field_names)
        return ExtractionResponse(extracted_fields=extracted_fields)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/extract")
async def extract_fields_get(transcription: str, pdf_field_names: str):
    """GET endpoint for extracting fields (for testing)."""
    try:
        # Parse comma-separated field names
        field_names = [name.strip() for name in pdf_field_names.split(",")]
        extracted_fields = call_llm(transcription, field_names)
        return {"extracted_fields": extracted_fields}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001) 