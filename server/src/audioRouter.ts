import express from "express";
import { sessionStore, upload, MulterRequest } from "./shared";
import { getExtractedFields, transcribeAudio } from "./utils";
import { validateSessionId } from ".";

// Ensure Express.Request is extended with sessionToken (as in index.ts)
declare global {
  namespace Express {
    interface Request {
      sessionToken?: string;
    }
  }
}

const router = express.Router();

// GET /api/audio (audio blob)
router.get("/", validateSessionId, (req: express.Request, res: express.Response) => {
  const sessionToken = req.sessionToken;
  if (!sessionToken) {
    res.status(401).json({ error: "No session token provided" });
    return;
  }
  const session = sessionStore.get(sessionToken);
  if (!session || !session.pdfBuffer) {
    res.status(404).json({ error: "PDF not found" });
    return;
  }
  if (!session.audioBuffer) {
    res.status(404).json({ error: "Audio not found" });
    return;
  }
  res.setHeader("Content-Type", "audio/webm");
  res.setHeader("Content-Disposition", "attachment; filename=audio.webm");
  res.send(session.audioBuffer);
});

// POST /api/audio - Kick off async processing
router.post(
  "/",
  validateSessionId,
  upload.single("audio"),
  async (req: express.Request, res: express.Response) => {
    const file = (req as MulterRequest).file;
    const sessionToken = req.sessionToken!; // Validated by middleware

    if (!file) {
      return res.status(400).json({ error: "No audio file uploaded" });
    }

    const session = sessionStore.get(sessionToken)!;
    session.audioBuffer = file.buffer;

    // Immediate response - processing happens in background
    res.status(202).json({ message: "Processing started" });

    // Start async workflow
    processAudioWithWebSocketUpdates(sessionToken);
  }
);

// Async processor with WebSocket updates
async function processAudioWithWebSocketUpdates(sessionToken: string) {
  const session = sessionStore.get(sessionToken)!;
  const ws = websocketSessions.get(sessionToken);

  try {
    // Stage 1: Transcription
    ws?.send(JSON.stringify({ 
      type: "status", 
      status: "transcribing",
      progress: 20 
    }));

    session.transcription = await transcribeAudio(session.audioBuffer);

    // Stage 2: Field Extraction
    ws?.send(JSON.stringify({
      type: "status",
      status: "extracting_fields",
      progress: 60
    }));

    session.extractedFields = await getExtractedFields(
      session.pdfFields.map(f => f.name),
      session.transcription!
    );

    // Final result
    ws?.send(JSON.stringify({
      type: "complete",
      data: {
        transcription: session.transcription,
        extractedFields: session.extractedFields
      }
    }));
  } catch (error) {
    ws?.send(JSON.stringify({
      type: "error",
      error: error.message
    }));
  }
}

export default router; 