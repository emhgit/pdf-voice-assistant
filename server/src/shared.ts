import { Request } from "express";

// Use Express.Multer.File for Multer file typing
export type MulterFile = Express.Multer.File;

// TYPES/INTERFACES
export interface MulterRequest extends Request {
  file: MulterFile;
}

//SESSION STORE
export const sessionStore = new Map<
  string,
  {
    pdfBuffer?: Buffer;
    pdfFields?: { name: string; type: string; isEmpty: boolean }[];
    audioBuffer?: Buffer;
    transcription?: string;
    extractedFields?: Record<string, string>[];
  }
>();

const multer = require("multer");
export const upload = multer({ storage: multer.memoryStorage() }); //store files in memory storage 