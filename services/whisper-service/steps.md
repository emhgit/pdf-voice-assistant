1. Download and Set Up Whisper

```bash
# In your monorepo's python-microservices directory
python -m venv whisper-venv
source whisper-venv\Scripts\activate
```

# Install Whisper and dependencies

```bash
pip install openai-whisper
pip install torch torchaudio  # For CUDA support if you have NVIDIA GPU
pip install fastapi uvicorn python-multipart
```
Install ffmpeg for the model's audio processing:

```bash
choco install ffmpeg -y
```
2. Repository Structure
Add this to your monorepo:

text
monorepo/
  └── services/
      └── whisper-service/
          ├── main.py (FastAPI server)
          ├── requirements.txt
          ├── whisper-venv/ (virtual env)
          └── utils/
              └── transcribe.py
3. Create Transcription Function
Create services/whisper/utils/transcribe.py:

```py
python
import whisper
from typing import Optional
import tempfile
import os

# Load model once (can be small, medium, large based on your needs)
model = whisper.load_model("base")

def transcribe_audio(audio_blob: bytes, language: Optional[str] = None) -> str:
    """
    Transcribes audio blob to text using Whisper
    
    Args:
        audio_blob: Binary audio data
        language: Optional language code (e.g., 'en')
    
    Returns:
        Transcribed text
    """
    try:
        # Save blob to temp file
        with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp:
            tmp.write(audio_blob)
            tmp_path = tmp.name
        
        # Transcribe
        result = model.transcribe(tmp_path, language=language)
        
        # Clean up
        os.unlink(tmp_path)
        
        return result["text"]
    except Exception as e:
        raise RuntimeError(f"Transcription failed: {str(e)}")
```
4. Create FastAPI Endpoint
Create services/whisper/main.py:

```py
python
from fastapi import FastAPI, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional
from utils.transcribe import transcribe_audio

app = FastAPI(title="Whisper Transcription Service")

# CORS configuration (adjust for your needs)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In prod, specify your frontend URL
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

# POST endpoint (recommended)
@app.post("/transcribe")
async def transcribe_post(
    audio_file: UploadFile,
    language: Optional[str] = None
):
    try:
        audio_blob = await audio_file.read()
        transcription = transcribe_audio(audio_blob, language)
        return {"text": transcription}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
```
5. Update Requirements
Create services/whisper/requirements.txt:

```text
openai-whisper
torch
torchaudio
fastapi
uvicorn
python-multipart
```
6. Start the Microservice
```bash
# In services/whisper directory
uvicorn main:app --reload --port 8000
```
7. Integrate with Your Express Backend
In your Express backend, create a service to call the Whisper microservice:

```typescript
// services/whisperService.ts
import axios from 'axios';

const WHISPER_SERVICE_URL = 'http://localhost:8000';

export async function transcribeAudio(audioBuffer: Buffer, language?: string): Promise<string> {
  try {
    const formData = new FormData();
    const blob = new Blob([audioBuffer], { type: 'audio/wav' });
    formData.append('audio_file', blob, 'recording.wav');
    
    const response = await axios.post(`${WHISPER_SERVICE_URL}/transcribe`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      params: { language }
    });
    
    return response.data.text;
  } catch (error) {
    console.error('Transcription error:', error);
    throw new Error('Failed to transcribe audio');
  }
}
```
8. Create Express Endpoint
```typescript
// In your Express backend
import { transcribeAudio } from '../services/whisperService';
import multer from 'multer';

const upload = multer();

router.post('/api/audio', upload.single('audio'), async (req, res) => {
  try {
    ...previous code

    const transcription = await transcribeAudio(req.file.buffer);
    // Store transcription in your session store
    // ...

    res.json({ transcription });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```
### Additional Recommendations
Model Size: Consider using "small" or "medium" models for better accuracy if you have the GPU memory
