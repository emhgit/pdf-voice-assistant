import express from "express";
import crypto from "crypto";
import { getPdfFields, extractText } from "./utils";
import type { PdfMetadata } from "../../shared/src/types";
import { sessionStore, upload, MulterRequest } from "./shared";
import { validateSessionId } from "./middleware";

const router = express.Router();

// POST / (PDF upload)
router.post(
  "/",
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

      sessionStore.set(sessionId, {
        pdfBuffer: file.buffer,
        pdfFields: undefined,
        pdfText: undefined,
        audioBuffer: undefined,
        transcription: undefined,
        extractedFields: [],
        pdfReady: true,
        audioReady: false,
        transcriptionReady: false,
        extractedFieldsReady: false,
      });

      // Generate a timestamp for the upload
      const timestamp = Date.now();

      // Create Pdf Metadata
      const pdfMetadata: PdfMetadata = {
        fileName: file.originalname,
        fileSize: file.size,
        uploadTimestamp: timestamp,
      };

      res.status(200).json({
        message: "PDF uploaded successfully",
        sessionId: sessionId,
        pdfMetadata,
      });

      // Process PDF fields
      processPdf(sessionId);
    } catch (error) {
      console.error("Error processing PDF upload:", error);
      res.status(500).json({ error: "Failed to process PDF upload" });
    }
  }
);

const processPdf = async (sessionId: string) => {
  const session = sessionStore.get(sessionId);
  if (!session || !session.pdfBuffer) {
    throw new Error("Session not found or PDF buffer is empty");
  }
  const fields = await getPdfFields(session.pdfBuffer!);
  console.log("fields: ", fields);
  session.pdfFields = fields;
  const text = await extractText(new Uint8Array(session.pdfBuffer));
  console.log("Extracted text:", text);
  session.pdfText = text;
};

// GET / (PDF buffer download)
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
    if (!session || !session.pdfBuffer) {
      res.status(404).json({ error: "PDF not found" });
      return;
    }
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=document.pdf");
    res.send(session.pdfBuffer);
  }
);

// GET /fields (PDF fields)
router.get(
  "/fields",
  validateSessionId,
  (req: express.Request, res: express.Response) => {
    const sessionToken = req.sessionToken;
    if (!sessionToken) {
      res.status(401).json({ error: "No session token provided" });
      return;
    }
    const session = sessionStore.get(sessionToken);
    if (!session || !session.pdfFields) {
      res.status(404).json({ error: "PDF fields not found" });
      return;
    }
    res.status(200).json({ fields: session.pdfFields });
  }
);

router.put(
  "/",
  validateSessionId,
  upload.single("pdf"),
  (req: express.Request, res: express.Response) => {
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
    // Update the PDF buffer in the session store
    const file = (req as MulterRequest).file;
    if (file) {
      session.pdfBuffer = file.buffer;
      session.pdfReady = true;
    } else {
      res.status(400).json({ error: "No pdf file uploaded" });
      return;
    }

    res.status(200).json({ message: "PDF updated successfully" });
  }
);

router.get(
  "/text",
  validateSessionId,
  (req: express.Request, res: express.Response) => {
    const sessionToken = req.sessionToken;
    if (!sessionToken) {
      res.status(401).json({ error: "No session token provided" });
      return;
    }
    const session = sessionStore.get(sessionToken);
    if (!session || !session.pdfBuffer) {
      res.status(404).json({ error: "PDF Buffer not found" });
      return;
    }

    extractText(new Uint8Array(session.pdfBuffer))
      .then((text) => {
        console.log(text);
        res.status(200).json({ text });
      })
      .catch((error) => {
        console.error("Error extracting text from PDF:", error);
        res.status(500).json({ error: "Failed to extract text from PDF" });
      });
  }
);

export default router;
