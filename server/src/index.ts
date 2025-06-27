import express from "express";
import { Request } from "express";
import { rateLimit } from "express-rate-limit";
import type {
  PdfMetadata,
} from "../../shared/src/types";
import { getExtractedFields, getPdfFields, transcribeAudio } from "./utils";

// Extend Express Request interface to include sessionToken
declare global {
  namespace Express {
    interface Request {
      sessionToken?: string;
    }
  }
}

// Use Express.Multer.File for Multer file typing
type MulterFile = Express.Multer.File;
const app = express();
const cors = require("cors");
const port = 2008;

const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() }); //store files in memory storage

// TYPES/INTERFACES
interface MulterRequest extends Request {
  file: MulterFile;
}

//SESSION STORE
const sessionStore = new Map<
  string,
  {
    pdfBuffer?: Buffer;
    pdfFields?: { name: string; type: string; isEmpty: boolean }[];
    audioBuffer?: Buffer;
    transcription?: string;
    extractedFields?: Record<string, string>[];
  }
>();

/*
sessionStore.set("test-session", {
  pdfFields: [
    { name: "First Name", type: "TextField", isEmpty: true },
    { name: "Last Name", type: "TextField", isEmpty: true },
    { name: "Date", type: "TextField", isEmpty: true },
  ],
});

console.log("Session Store Initialized: " + sessionStore.get("test-session"));
*/

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 50, // Limit each IP to 50 requests per windowMs
  message: "Too many requests, please try again later.",
});

// Apply the rate limiting middleware to all requests
app.use(limiter);

//CORS Middleware
app.use(cors());

//PDF Upload Route
app.post(
  "/api/pdf",
  upload.single("pdf"),
  async (req: express.Request, res: express.Response) => {
    try {
      const file = (req as MulterRequest).file;

      if (!file) {
        res.status(400).json({ error: "No file uploaded" });
        return;
      }

      // Verify it's a PDF file
      if (file.mimetype !== "application/pdf") {
        res.status(400).json({ error: "File must be a PDF" });
        return;
      }

      // Generate a UUID for the session id to store in the session store
      const sessionId = crypto.randomUUID();
      const fields = await getPdfFields(file.buffer);
      console.log("fields: " + fields);
      sessionStore.set(sessionId, {
        pdfBuffer: file.buffer,
        pdfFields: fields,
      });

      // Generate a UUID for the session token
      const timestamp = Date.now();

      // Create Pdf Metadata
      const pdfMetadata: PdfMetadata = {
        fileName: file.filename,
        fileSize: file.size,
        uploadTimestamp: timestamp,
      };

      res.status(200).json({
        message: "PDF uploaded successfully",
        sessionId: sessionId,
        pdfMetadata,
      });
    } catch (error) {
      console.error("Error processing PDF upload:", error);
      res.status(500).json({ error: "Failed to process PDF upload" });
    }
  }
);

// Session ID validation middleware (activates after /api/pdf POST)
const validateSessionId: express.RequestHandler = (req, res, next) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Missing or invalid token" });
    return;
  }

  const token = authHeader.split(" ")[1];
  req.sessionToken = token;

  next();
};

// Apply the middleware to all routes after /api/pdf POST
app.use(validateSessionId);

// GET req for the pdf buffer
app.get("/api/pdf", (req, res) => {
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
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", "attachment; filename=document.pdf");
  res.send(session.pdfBuffer);
});

// GET req for audio blob
app.get("/api/audio", (req, res) => {
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

//Return extracted fields
app.get("/api/pdf-fields", (req, res) => {});

//Audio Upload Route
app.post(
  "/api/audio",
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

//get audio transcription
app.get("/api/transcription", (req, res) => {
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

// update audio transcription
app.put("/api/transcription", (req, res) => {});

// Update extracted key-value pairs
//app.post("/api/extract", (req, res) => {});

// get extracted key-value pairs
app.get("/api/extract", (req, res) => {
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

// update extracted key-value pairs
app.put("/api/extract", (req, res) => {});

// get finalized pdf
app.get("/api/download", (req, res) => {});

// start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
