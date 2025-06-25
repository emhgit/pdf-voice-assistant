# LLM Service

This microservice provides LLM-powered field extraction from audio transcriptions for PDF form filling.

## Prerequisites

1. **Ollama Installation**: Make sure you have Ollama installed and the Mistral model pulled:
   ```bash
   ollama pull mistral
   ```

2. **Python Dependencies**: Install the required packages:
   ```bash
   pip install -r requirements.txt
   ```

## Running the Service

Start the FastAPI server:
```bash
uvicorn main:app --reload --port 8001
```

Or run directly:
```bash
python main.py
```

The service will be available at `http://localhost:8001`

## API Endpoints

### Health Check
- **GET** `/` - Check if the service is running

### Extract Fields
- **POST** `/extract` - Extract structured data from transcription
- **GET** `/extract` - Extract fields (for testing)

### POST /extract
Request body:
```json
{
  "transcription": "My name is John Doe and I am 30 years old",
  "pdf_field_names": ["name", "age", "email"]
}
```

Response:
```json
{
  "extracted_fields": {
    "name": "John Doe",
    "age": "30",
    "email": ""
  }
}
```

### GET /extract (for testing)
Query parameters:
- `transcription`: The audio transcription text
- `pdf_field_names`: Comma-separated list of PDF field names

Example:
```
GET /extract?transcription=My%20name%20is%20John&pdf_field_names=name,age
```

## Testing

Test the service with curl:
```bash
curl -X POST "http://localhost:8001/extract" \
  -H "Content-Type: application/json" \
  -d '{"transcription": "My name is John Doe", "pdf_field_names": ["name", "age"]}'
```