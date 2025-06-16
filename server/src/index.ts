import express from "express";
import { Request } from "express";
import type {
  PdfMetadata,
  PdfUploadFormResponse,
} from "../../shared/src/types";
import { getPdfFieldNames } from "./utils";

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

const sessionStore = new Map<
  string,
  {
    pdfBuffer: Buffer;
    pdfFieldNames: { name: string; type: string; isEmpty: boolean }[];
    audioBuffer?: Buffer;
    transcription?: string;
    extractedData?: object;
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
      const fieldNames = await getPdfFieldNames(file.buffer);
      console.log("fieldNames:" + fieldNames);
      sessionStore.set(sessionId, {
        pdfBuffer: file.buffer,
        pdfFieldNames: fieldNames,
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

//Audio Upload Route
app.post("/api/audio", (req, res) => {});

//Trnscription Route
app.post("/api/process", (req, res) => {});

//npx ts-node index.ts to start
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
