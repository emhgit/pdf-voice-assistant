import express from "express";
import { sessionStore } from "./shared";
import { validateSessionId } from "./middleware";

const router = express.Router();

// GET /status (Check processing status)
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
    if (!session) {
      res.status(404).json({ error: "Session not found" });
      return;
    }
    res.status(200).json({
      pdfReady: session.pdfReady,
      audioReady: session.audioReady,
      transcriptionReady: session.transcriptionReady,
      extractedFieldsReady: session.extractedFieldsReady,
    });
  }
);

export default router;
