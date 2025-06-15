import express from "express";
import fs from "fs";
import { Request } from "express";
import path from "path";
// Use Express.Multer.File for Multer file typing
type MulterFile = Express.Multer.File;
const app = express();
const cors = require("cors");
const port = 2008;

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() }); //store files in memory storage

interface MulterRequest extends Request {
  file: MulterFile;
}

//CORS Middleware
app.use(cors());

//PDF Upload Route
app.post(
  "/api/pdf",
  upload.single("pdf"),
  (req: express.Request, res: express.Response) => {
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

      // Generate a unique filename using timestamp and original filename
      const timestamp = Date.now();
      const uniqueFilename = `${timestamp}-${file.originalname}`;
      const filePath = path.join(uploadsDir, uniqueFilename);

      // Save the file to the filesystem
      fs.writeFileSync(filePath, file.buffer);
      
      res.status(200).json({
        message: "PDF uploaded successfully",
        filename: uniqueFilename,
        size: file.size,
        path: filePath
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
