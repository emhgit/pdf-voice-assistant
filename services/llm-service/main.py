import json
import os
from typing import List, Dict, Any
import ollama
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="LLM Service", description="AI PDF Assistant LLM Microservice")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure this properly for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ExtractionRequest:
    def __init__(self, transcription: str, pdf_field_names: List[str]):
        self.transcription = transcription
        self.pdf_field_names = pdf_field_names
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'ExtractionRequest':
        """Create ExtractionRequest from dictionary."""
        if not isinstance(data, dict):
            raise ValueError("Data must be a dictionary")
        
        transcription = data.get("transcription")
        if not isinstance(transcription, str):
            raise ValueError("transcription must be a string")
        
        pdf_field_names = data.get("pdf_field_names")
        if not isinstance(pdf_field_names, list):
            raise ValueError("pdf_field_names must be a list")
        
        return cls(transcription=transcription, pdf_field_names=pdf_field_names)

class ExtractionResponse:
    def __init__(self, extracted_fields: Dict[str, str]):
        self.extracted_fields = extracted_fields
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON response."""
        return {"extracted_fields": self.extracted_fields}

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
    # print(f"Starting call_llm with transcription: {transcription[:100]}...")  # Debug
    # print(f"PDF field names: {pdf_field_names}")  # Debug
    
    prompt_template = load_prompt_template()
    # print(f"Loaded prompt template: {prompt_template}")  # <-- Add this
    
    # Format the prompt with the provided data
    # print("About to format prompt...")  # Debug
    prompt = prompt_template.format(
        transcription=transcription,
        pdf_field_names=json.dumps(pdf_field_names)
    )
    # print(f"prompt: {prompt}")
    
    # print("About to call ollama.generate...")  # Debug
    try:
        response = ollama.generate(
            model="mistral",
            prompt=prompt,
            format="json",
            options={"temperature": 0.1}  # Reduce randomness for structured output
        )
        # print("ollama.generate completed successfully")  # Debug
        
        # Parse the JSON response
        response_text = response.get("response", "{}")
        # print(f"Raw LLM response: {response_text}")  # Add logging

        # Clean the response (remove markdown code blocks if present)
        response_text = response_text.strip().replace('```json', '').replace('```', '').replace('\\"', '"').strip()

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
                try:
                    value = extracted_data.get(matching_key, "")
                    result[field_name] = value
                except Exception as e:
                    print(f"Error while accessing extracted_data[{matching_key}]: {e}")
                    result[field_name] = ""
            return result
        except json.JSONDecodeError as e:
            print(f"Invalid JSON response from LLM: {response_text}. Error: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail=f"Invalid JSON response from LLM: {response_text}. Error: {str(e)}"
            )
            
    except Exception as e:
        print(f"LLM error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"LLM error: {str(e)}")

@app.get("/")
async def root():
    """Health check endpoint."""
    return {"message": "LLM Service is running", "status": "healthy"}

@app.post("/extract")
async def extract_fields(request_data: Dict[str, Any]):
    """Extract structured data from transcription using LLM."""
    try:
        # Parse the request data manually
        request = ExtractionRequest.from_dict(request_data)
        extracted_fields = call_llm(request.transcription, request.pdf_field_names)
        response = ExtractionResponse(extracted_fields=extracted_fields)
        return response.to_dict()
    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"Invalid request data: {str(e)}")
    except Exception as e:
        print(f"Error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

@app.get("/extract")
async def extract_fields_get(transcription: str, pdf_field_names: str):
    """GET endpoint for extracting fields (for testing)."""
    try:
        # Parse comma-separated field names
        field_names = [name.strip() for name in pdf_field_names.split(",")]
        extracted_fields = call_llm(transcription, field_names)
        return {"extracted_fields": extracted_fields}
    except Exception as e:
        print(f"Error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001) 