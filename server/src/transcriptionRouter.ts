import express from "express";
import { sessionStore } from "./shared";
import { validateSessionId } from "./middleware";

// Ensure Express.Request is extended with sessionToken (as in index.ts)
declare global {
  namespace Express {
    interface Request {
      sessionToken?: string;
    }
  }
}

const router = express.Router();

// GET /api/transcription
router.get("/", validateSessionId, (req: express.Request, res: express.Response) => {
  const sessionToken = req.sessionToken;
  if (!sessionToken) {
    res.status(401).json({ error: "No session token provided" });
    return;
  }
  const session = sessionStore.get(sessionToken);
  if (!session || !session.transcription) {
    res.status(404).json({ error: "Transcription not found" });
    return;
  }
  res.status(200).json({ transcription: session.transcription });
});

// PUT /api/transcription (update transcription)
router.put("/", validateSessionId, (req: express.Request, res: express.Response) => {
  // Implement update logic here if needed
  res.status(501).json({ error: "Not implemented" });
});

export default router; 