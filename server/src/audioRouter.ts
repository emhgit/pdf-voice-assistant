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

// POST /api/audio (audio upload)
router.post(
  "/",
  validateSessionId,
  upload.single("audio"),
  async (req: express.Request, res: express.Response) => {
    try {
      const file = (req as MulterRequest).file;
      const sessionToken = req.sessionToken;

      if (!file) {
        res.status(400).json({ error: "No audio file uploaded" });
        return;
      }

      if (!sessionToken) {
        res.status(401).json({ error: "No session token provided" });
        return;
      }

      const session = sessionStore.get(sessionToken);
      if (!session) {
        res.status(404).json({ error: "Session not found" });
        return;
      }

      // Store the audio buffer in the session
      session.audioBuffer = file.buffer;

      // Transcribe audio and store transcription
      let transcription = null;
      try {
        transcription = await transcribeAudio(file.buffer);
        session.transcription = transcription;
      } catch (err) {
        console.error("Transcription failed:", err);
      }
      console.log("Transcription: ", transcription);

      const pdfFields = session.pdfFields;
      if (!pdfFields) {
        res.status(400).json({ error: "PDF fields not available" });
        return;
      }
      // Extract key-value pairs from transcription
      let extractedFields = null;
      try {
        extractedFields = await getExtractedFields(
          pdfFields.map((field) => field.name),
          transcription!
        );
        session.extractedFields = extractedFields;
      } catch (error) {
        console.error("Error extracting fields:", error);
        res.status(500).json({ error: "Failed to extract fields" });
        return;
      }

      res.status(200).json({
        message: "Audio uploaded successfully",
        fileName: file.originalname,
        fileSize: file.size,
        mimeType: file.mimetype,
        transcription,
        extractedFields,
      });
    } catch (error) {
      console.error("Error processing audio upload:", error);
      res.status(500).json({ error: "Failed to process audio upload" });
    }
  }
);

export default router; 