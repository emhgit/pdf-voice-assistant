import express from "express";

// Ensure Express.Request is extended with sessionToken (as in index.ts)
declare global {
  namespace Express {
    interface Request {
      sessionToken?: string;
    }
  }
}

const router = express.Router();

// GET /api/download (get finalized pdf)
router.get("/", (req: express.Request, res: express.Response) => {
  // Implement finalized PDF download logic here if needed
  res.status(501).json({ error: "Not implemented" });
});

export default router; 