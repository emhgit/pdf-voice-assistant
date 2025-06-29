import json
import os
from typing import List, Dict, Any, TypedDict
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

class PdfField(TypedDict):
    name: str
    type: str
    value: str

class ExtractionRequest:
    def __init__(self, transcription: str, pdf_fields: List[PdfField], pdf_text: str):
        self.transcription = transcription
        self.pdf_fields = pdf_fields
        self.pdf_text = pdf_text
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'ExtractionRequest':
        """Create ExtractionRequest from dictionary."""
        if not isinstance(data, dict):
            raise ValueError("Data must be a dictionary")
        
        transcription = data.get("transcription")
        if not isinstance(transcription, str):
            raise ValueError("transcription must be a string")
        
        pdf_fields = data.get("pdf_fields")
        if not isinstance(pdf_fields, list):
            raise ValueError("pdf_fields must be a list")
        
        # Validate each field in the list
        validated_fields = []
        for field in pdf_fields:
            if not isinstance(field, dict):
                raise ValueError("Each pdf_field must be a dictionary")
            if "name" not in field or "type" not in field or "value" not in field:
                raise ValueError("Each pdf_field must have 'name', 'type', and 'value' properties")
            if not isinstance(field["name"], str) or not isinstance(field["type"], str) or not isinstance(field["value"], str):
                raise ValueError("pdf_field 'name', 'type', and 'value' must be strings")
            validated_fields.append(field)
        
        pdf_text = data.get("pdf_text")
        if not isinstance(pdf_text, str):
            raise ValueError("pdf_text must be a string")
        
        return cls(transcription=transcription, pdf_fields=validated_fields, pdf_text=pdf_text)

class ExtractionResponse:
    def __init__(self, extracted_fields: Dict[str, str]):
        self.extracted_fields = extracted_fields
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON response."""
        return {"extracted_fields": self.extracted_fields}

def load_prompt_template() -> str:
    """Load the prompt template from file."""
    prompt_path = os.path.join(os.path.dirname(__file__), "prompts", "extract_fields_1.txt")
    try:
        with open(prompt_path, "r", encoding="utf-8") as f:
            return f.read().strip()
    except FileNotFoundError:
        # Fallback to inline prompt if file not found
        return """As an intelligent PDF form assistant, your goal is to accurately extract and structure data from a user's spoken transcription to fill out a PDF form. You must interpret the user's natural language input, adapting to potentially dynamic or non-standard form field names, and provide the extracted data in a precise JSON format.

**Instructions:**

1.  **Analyze User Intent:** Carefully read the `Transcription` to understand the user's intention for filling the form fields.
2.  **Contextual Mapping:** Use the `PDF Field Names` and `PDF Text` as context to semantically match the spoken information to the appropriate form fields. Prioritize direct matches, then infer based on common form conventions.
3.  **Strict JSON Output:** Return ONLY a JSON object. Each key in the JSON object MUST correspond exactly to a `PDF Field Name` provided.
4.  **Value Extraction:** The value for each key MUST be the extracted data from the `Transcription`.
5.  **Date Format:** All extracted dates MUST be formatted as `mm/dd/yyyy`.
6.  **Unmatched Fields:** If a `PDF Field Name` has no corresponding, relevant information in the `Transcription`, its value in the JSON MUST be an empty string (`""`).
7.  **Irrelevant Information:** Ignore any information in the `Transcription` that is not relevant to the provided `PDF Field Names` or is redundant.

---

**Input Data:**

* **Transcription:** "{transcription}"
* **PDF Fields:** {pdf_fields}
* **PDF text:** {pdf_text}

---

**Desired Output Format (JSON):**

Use this format: {{"field_name": "value"}} for each field.
"""
    

def call_llm(transcription: str, pdf_fields: List[PdfField], pdf_text: str) -> Dict[str, str]:
    """Call the LLM to extract structured data from transcription."""

    prompt_template = load_prompt_template()
    
    
    # Format the prompt with the provided data
    prompt = prompt_template.format(
        transcription=transcription,
        pdf_fields=json.dumps(pdf_fields, indent=2),  # Use indent for better readability
        pdf_text=pdf_text  
    )
    
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
            for field in pdf_fields:
                field_name = field["name"]
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
        extracted_fields = call_llm(request.transcription, request.pdf_fields, request.pdf_text)
        response = ExtractionResponse(extracted_fields=extracted_fields)
        return response.to_dict()
    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"Invalid request data: {str(e)}")
    except Exception as e:
        print(f"Error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001) 