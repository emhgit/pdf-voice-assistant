Here’s a step-by-step guide to implement the LLM microservice for your AI PDF Assistant:

---

### **1. Download Ollama**

1. **Install Ollama**:
   - Visit [Ollama’s official website](https://ollama.ai/) and download the appropriate version for your OS (Windows/macOS/Linux).
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
   - Set up a `llm-service` directory in your monorepo (e.g., `/services/llm`).
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
   from pydantic import BaseModel

   app = FastAPI()

   class ExtractionRequest(BaseModel):
       transcription: str
       pdf_field_names: list[str]

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

   @app.get("/extract")
   async def extract_fields(transcription: str, pdf_field_names: list[str]):
       return call_llm(transcription, pdf_field_names)
   ```

---

### **5. Expose the Endpoint**

1. **Run the Microservice**:
   - Start the FastAPI server:
     ```bash
     uvicorn main:app --reload --port 8001
     ```
2. **Test the Endpoint**:
   - Call `GET /extract` with query parameters:
     ```bash
     curl "http://localhost:8001/extract?transcription=My%20name%20is%20John&pdf_field_names=name,age"
     ```
   - Expected response:
     ```json
     { "name": "John", "age": "" }
     ```

---

### **Meta Prompt: Mistral vs. Other LLMs (e.g., DeepSeek)**

- **Mistral (via Ollama)**:
  - **Pros**: Lightweight, locally runnable, offline-capable, low latency.
  - **Cons**: Limited to Ollama’s model zoo (but supports Llama 2, Mistral, etc.).
- **DeepSeek**:
  - **Pros**: Potentially better accuracy for niche tasks.
  - **Cons**: May require API calls (not fully local), higher cost/complexity.
- **Recommendation**: Stick with Mistral for now (aligns with your "local-first" requirement). Later, benchmark against DeepSeek if needed.

---

### **Additional Notes**

- **Error Handling**: Add retry logic in `call_llm` for transient Ollama failures.
- **Session ID**: Integrate with your existing session store (pass `sessionId` to `/extract` and fetch `pdf_field_names` from memory).
- **Validation**: Use Pydantic to validate the LLM’s JSON output before returning it.
