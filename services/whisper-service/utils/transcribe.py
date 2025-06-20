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
        # Save blob to temp file as .webm
        with tempfile.NamedTemporaryFile(suffix=".webm", delete=False) as tmp:
            tmp.write(audio_blob)
            tmp_path = tmp.name
        
        # Transcribe
        result = model.transcribe(tmp_path, language=language)
        
        # Clean up
        os.unlink(tmp_path)
        
        return result["text"]
    except Exception as e:
        raise RuntimeError(f"Transcription failed: {str(e)}")
