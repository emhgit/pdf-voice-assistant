/// <reference types="cors" />
import express from "express";
import { rateLimit } from "express-rate-limit";
import cors from "cors";
import pdfRouter from "./pdfRouter";
import audioRouter from "./audioRouter";
import transcriptionRouter from "./transcriptionRouter";
import extractRouter from "./extractRouter";
import downloadRouter from "./downloadRouter";
import statusRouter from "./statusRouter";

// If you see a TS error for 'cors', run: npm i --save-dev @types/cors

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
app.use(express.json()); // Parse JSON bodies

// Register routers
app.use("/api/status", statusRouter);
app.use("/api/pdf", pdfRouter);
app.use("/api/audio", audioRouter);
app.use("/api/transcription", transcriptionRouter);
app.use("/api/extract", extractRouter);
app.use("/api/download", downloadRouter);

// start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
