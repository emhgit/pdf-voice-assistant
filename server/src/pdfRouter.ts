import express from "express";
import crypto from "crypto";
import { getPdfFields } from "./utils";
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
      const fields = await getPdfFields(file.buffer);
      console.log("fields: ", fields);
      sessionStore.set(sessionId, {
        pdfBuffer: file.buffer,
        pdfFields: fields,
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
    } catch (error) {
      console.error("Error processing PDF upload:", error);
      res.status(500).json({ error: "Failed to process PDF upload" });
    }
  }
);

// GET / (PDF buffer download)
router.get("/", validateSessionId, (req: express.Request, res: express.Response) => {
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

// GET /fields (PDF fields)
router.get("/fields", validateSessionId, (req: express.Request, res: express.Response) => {
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
});

export default router;