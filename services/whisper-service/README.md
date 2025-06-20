# Whisper AI Service

This microservices uses Whisper AI to transcribe audio to text. The service is exposed at an endpoint using fastAPI.

Set up the Python virtual environment and install dependencies in services/whisper-service:

```bash
python -m venv whisper-venv
whisper-venv\Scripts\activate
pip install -r requirements.txt
```

Start the microservice server:

```bash
uvicorn main:app --reload --port 8000
```

Test Microservice using CURL:

```bash
curl -X POST "http://localhost:8000/transcribe" \
  -F "audio_file=@path\to\your\file.wav"
```

OR

```bash
curl -X POST "http://localhost:8000/transcribe" \
  -F "audio_file=@path\to\your\file.mp3"
```
