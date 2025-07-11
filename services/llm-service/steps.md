Step-by-step guide to implement the LLM microservice:

---

### **1. Download Ollama**

1. **Install Ollama**:
   - Visit [Ollama's official website](https://ollama.ai/) and download the appropriate version for your OS (Windows/macOS/Linux).
   - Follow the installation instructions.
2. **Pull Mistral Model**:
   - Run the following command in your terminal:
     ```bash
     ollama pull mistral
     ```
   - Verify the installation:
     ```bash
     ollama list
     ```

---

### **2. Integrate Ollama/Mistral into Your Repository**

1. **Create a Python Microservice**:
   - Set up a `llm-service` directory in your monorepo (e.g., `/services/llm-service`).
   - Use FastAPI for the server framework (install with `pip install fastapi uvicorn`).
2. **Add Ollama Python Client**:
   - Install the Ollama Python library:
     ```bash
     pip install ollama
     ```
3. **Structure the Service**:
   ```
   services/llm-service/
   ├── main.py          # FastAPI server
   ├── requirements.txt # Dependencies
   └── prompts/         # Store prompt templates
   ```

---

### **3. Create the LLM Prompt for JSON Response**

1. **Design the Prompt**:

   - Save a prompt template in `/prompts/extract_fields.txt`:

     ```text
     Extract structured data from the following transcription to fill out a PDF form.
     Return ONLY a JSON object where each key is a PDF field name and the value is the extracted data.
     Use this format: {"field_name": "value"}.

     Transcription: "{transcription}"

     PDF Field Names: {pdf_field_names}

     Rules:
     - Ignore irrelevant or repeated information.
     - Match values to the closest field name semantically.
     - Return empty ("") for unmatched fields.
     ```

2. **Replace Placeholders**:
   - Dynamically inject `transcription` (user audio text) and `pdf_field_names` (from PDF metadata) at runtime.

---

### **4. Create the LLM Calling Function**

1. **Implement in `main.py`**:

   ```python
   import ollama
   from fastapi import FastAPI, HTTPException
   from typing import Dict, Any

   app = FastAPI()

   class ExtractionRequest:
       def __init__(self, transcription: str, pdf_field_names: list[str]):
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

   def call_llm(transcription: str, pdf_field_names: list[str]) -> dict:
       prompt = f"""
       Extract structured data from the following transcription to fill out a PDF form.
       Return ONLY a JSON object where each key is a PDF field name and the value is the extracted data.
       Use this format: {{"field_name": "value"}}.

       Transcription: "{transcription}"

       PDF Field Names: {pdf_field_names}

       Rules:
       - Ignore irrelevant or repeated information.
       - Match values to the closest field name semantically.
       - Return empty ("") for unmatched fields.
       """
       try:
           response = ollama.generate(
               model="mistral",
               prompt=prompt,
               format="json",
               options={"temperature": 0.1}  # Reduce randomness for structured output
           )
           return response["response"]
       except Exception as e:
           raise HTTPException(status_code=500, detail=f"LLM error: {str(e)}")

   @app.post("/extract")
   async def extract_fields(request_data: Dict[str, Any]):
       try:
           # Parse the request data manually
           request = ExtractionRequest.from_dict(request_data)
           extracted_fields = call_llm(request.transcription, request.pdf_field_names)
           return {"extracted_fields": extracted_fields}
       except ValueError as e:
           raise HTTPException(status_code=400, detail=f"Invalid request data: {str(e)}")
       except Exception as e:
           raise HTTPException(status_code=500, detail=f"Error: {str(e)}")
   ```

---

### **5. Expose the Endpoint**

1. **Run the Microservice**:
   - Start the FastAPI server:
     ```bash
     uvicorn main:app --reload --port 8001
     ```
2. **Test the Endpoint**:
   - Call `POST /extract` with JSON body:
     ```bash
     curl -X POST "http://localhost:8001/extract" \
          -H "Content-Type: application/json" \
          -d '{"transcription": "My name is John", "pdf_field_names": ["name", "age"]}'
     ```
   - Expected response:
     ```json
     { "extracted_fields": { "name": "John", "age": "" } }
     ```

---

### **Additional Notes**

- **Error Handling**: Add retry logic in `call_llm` for transient Ollama failures.
- **Session ID**: Integrate with your existing session store (pass `sessionId` to `/extract` and fetch `pdf_field_names` from memory).
