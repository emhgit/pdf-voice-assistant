# Whisper AI Service

This microservices uses Whisper AI to transcribe audio to text. The service is exposed at an endpoint using fastAPI. 

Set up the Python virtual environment and install dependencies in services/whisper-service:

```bash
python -m venv whisper-venv
whisper-venv\Scripts\activate
pip install -r requirements.txt
```

Start the microservice:

```bash
uvicorn main:app --reload --port 8000
```