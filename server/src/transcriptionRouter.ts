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
router.get(
  "/",
  validateSessionId,
  (req: express.Request, res: express.Response) => {
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
  }
);

router.put(
  "/",
  validateSessionId,
  async (req: express.Request, res: express.Response) => {
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

    // Update the transcription in the session store
    const { transcription } = req.body;
    if (transcription) {
      session.transcription = transcription;
    } else {
      res.status(400).json({ error: "No transcription provided" });
      return;
    }

    res.status(200).json({
      message: "Transcription updated successfully",
      transcription: session.transcription,
    });
  }
);

export default router;
