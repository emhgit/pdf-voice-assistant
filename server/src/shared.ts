import { Request } from "express";
import WebSocket, { WebSocketServer } from "ws";
import { PdfField } from "../../shared/src/types";

// Use Express.Multer.File for Multer file typing
export type MulterFile = Express.Multer.File;

// TYPES/INTERFACES
export interface MulterRequest extends Request {
  file: MulterFile;
}

// SESSION STORE
export const sessionStore = new Map<
  string,
  {
    pdfBuffer: Buffer | undefined;
    pdfFields: PdfField[] | undefined;
    pdfText: string | undefined;
    audioBuffer: Buffer | undefined;
    transcription: string | undefined;
    extractedFields: Record<string, string>[];
    pdfReady: boolean;
    audioReady: boolean;
    transcriptionReady: boolean;
    extractedFieldsReady: boolean;
  }
>();

/*
// Test sessoion data
sessionStore.set("test-session", {
  pdfBuffer: undefined,
  pdfFields: [{ name: "Name", type: "PDFTextField", value: null }],
  pdfText: undefined,
  audioBuffer: new Buffer(0), // Empty buffer for testing
  transcription: undefined,
  extractedFields: [],
  pdfReady: true,
  audioReady: true,
  transcriptionReady: true,
  extractedFieldsReady: false,
});
console.log("Session store initialized with test session data.");
*/

const wss = new WebSocketServer({ port: 2025 });

export const websocketSessions = new Map<string, WebSocket>();

wss.on("connection", (ws, req) => {
  const url = req.url || "";
  const params = new URLSearchParams(url.split("?")[1] || "");
  const token = params.get("token");
  console.log("token", token);
  if (!token) return;
  addWebSocketToSession(token, ws);
  ws.on("close", () => removeWebSocketFromSession(token));
});

// 2. create a function to add a websocket to the map
export function addWebSocketToSession(sessionId: string, ws: WebSocket): void {
  if (!websocketSessions.has(sessionId)) {
    websocketSessions.set(sessionId, ws);
  } else {
    console.warn(`WebSocket for session ${sessionId} already exists.`);
  }
}

// 3. create a function to remove a websocket from the map
export function removeWebSocketFromSession(sessionId: string): void {
  if (websocketSessions.has(sessionId)) {
    websocketSessions.delete(sessionId);
  } else {
    console.warn(`WebSocket for session ${sessionId} does not exist.`);
  }
}

const multer = require("multer");
export const upload = multer({ storage: multer.memoryStorage() }); //store files in memory storage
