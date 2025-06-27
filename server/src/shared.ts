import { Request } from "express";
import WebSocket, { WebSocketServer } from "ws";

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
    pdfBuffer?: Buffer;
    pdfFields?: { name: string; type: string; isEmpty: boolean }[];
    audioBuffer?: Buffer;
    transcription?: string;
    extractedFields?: Record<string, string>[];
  }
>();

const wss = new WebSocketServer({ port: 2025 });

export const websocketSessions = new Map<string, WebSocket>();

wss.on("connection", (ws, req) => {
    const authHeader = req.headers["authorization"];

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return;
    }
    
    const token = authHeader.split(" ")[1];

    if (token) addWebSocketToSession(token, ws);
    ws.on("close", () => removeWebSocketFromSession(token));
  });


// 2. create a function to add a websocket to the map
export function addWebSocketToSession(
  sessionId: string,
  ws: WebSocket
): void {
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