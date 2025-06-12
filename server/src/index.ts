import express from "express";
import fs from "fs";
import { Request } from "express";
// Use Express.Multer.File for Multer file typing
type MulterFile = Express.Multer.File;
const app = express();

const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() }); //store files in memory storage

interface MulterRequest extends Request {
  file: MulterFile;
}

//PDF Upload Route
app.post("/api/pdf", upload.single("pdf"), (req, res) => {
  const pdfBuffer = (req as MulterRequest).file.buffer; // Access the file in memory
  console.log(pdfBuffer);
  // Store in-memory or save to disk as needed
  fs.writeFileSync("uploads/latest.pdf", pdfBuffer);
  res.sendStatus(200);
});

//Audio Upload Route
app.post("/api/audio", (req, res) => {});

//Trnscription Route
app.post("/api/process", (req, res) => {});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
