import express from "express";
import fs from "fs";
import { Request } from "express";
// Use Express.Multer.File for Multer file typing
type MulterFile = Express.Multer.File;
const app = express();
const cors = require("cors");
const port = 2008;

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
    console.log(req);
    //const pdfBuffer = (req as MulterRequest).file?.buffer; // Access the file in memory
  }
);

//Audio Upload Route
app.post("/api/audio", (req, res) => {});

//Trnscription Route
app.post("/api/process", (req, res) => {});

//npx ts-node index.ts
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
