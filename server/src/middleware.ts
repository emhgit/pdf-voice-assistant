import express from "express";

// Extend Express Request interface to include sessionToken
declare global {
  namespace Express {
    interface Request {
      sessionToken?: string;
    }
  }
}

// Session ID validation middleware
export const validateSessionId: express.RequestHandler = (req, res, next) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Missing or invalid token" });
    return;
  }

  const token = authHeader.split(" ")[1];
  req.sessionToken = token;

  next();
}; 