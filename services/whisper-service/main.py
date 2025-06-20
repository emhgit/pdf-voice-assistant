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
    print("Running on PORT 8000")
