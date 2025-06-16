import express from "express";
import { Request } from "express";
import type {
  PdfMetadata,
  PdfUploadFormResponse,
} from "../../shared/src/types";
import { getPdfFields } from "./utils";

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
    pdfBuffer: Buffer;
    pdfFields?: { name: string; type: string; isEmpty: boolean }[];
    audioBuffer?: Buffer;
    transcription?: string;
  }
>();

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

//Return extracted fields
app.get("/api/pdf-fields", (req, res) => {});

//Audio Upload Route
app.post("/api/audio", (req, res) => {
  try {
  } catch (e) {
    console.error(e);
  }
});

//get audio transcription
app.get("/api/transcription", (req, res) => {});

//get extracted key-value pairs
app.get("/api/extracted", (req, res) => {});

//update extracted key-value pairs
app.put("/api/extracted", (req, res) => {});

//Get final pdf Route
app.get("/api/download", (req, res) => {});

//npx ts-node index.ts to start
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
