/// <reference types="cors" />
import express from "express";
import { rateLimit } from "express-rate-limit";
import cors from "cors";
import pdfRouter from "./pdfRouter";
import audioRouter from "./audioRouter";
import transcriptionRouter from "./transcriptionRouter";
import extractRouter from "./extractRouter";
import downloadRouter from "./downloadRouter";
import { WebSocketServer } from "ws";

// If you see a TS error for 'cors', run: npm i --save-dev @types/cors

// Extend Express Request interface to include sessionToken
declare global {
  namespace Express {
    interface Request {
      sessionToken?: string;
    }
  }
}

const app = express();
const port = 2008;

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 50, // Limit each IP to 50 requests per windowMs
  message: "Too many requests, please try again later.",
});

// Apply the rate limiting middleware to all requests
app.use(limiter);

//CORS Middleware
app.use(cors());

// Register routers
app.use("/api/pdf", pdfRouter);
app.use("/api/audio", audioRouter);
app.use("/api/transcription", transcriptionRouter);
app.use("/api/extract", extractRouter);
app.use("/api/download", downloadRouter);

// Session ID validation middleware (activates after /api/pdf POST)
export const validateSessionId: express.RequestHandler = (req, res, next) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Missing or invalid token" });
    return;
  }

  const token = authHeader.split(" ")[1];
  req.sessionToken = token;

  next();
};

const wss = new WebSocketServer({ port: 2025 });

// start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
