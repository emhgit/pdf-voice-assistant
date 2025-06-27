import express from "express";
import { sessionStore } from "./shared";

// Ensure Express.Request is extended with sessionToken (as in index.ts)
declare global {
  namespace Express {
    interface Request {
      sessionToken?: string;
    }
  }
}

const router = express.Router();

// GET /api/extract (get extracted key-value pairs)
router.get("/", (req: express.Request, res: express.Response) => {
  const sessionToken = req.sessionToken;
  if (!sessionToken) {
    res.status(401).json({ error: "No session token provided" });
    return;
  }
  const session = sessionStore.get(sessionToken);
  if (!session || !session.transcription) {
    res.status(404).json({ error: "Extracted fields not found" });
    return;
  }
  res.status(200).json({
    fields: session.extractedFields || [],
  });
});

// PUT /api/extract (update extracted key-value pairs)
router.put("/", (req: express.Request, res: express.Response) => {
  // Implement update logic here if needed
  res.status(501).json({ error: "Not implemented" });
});

export default router; 