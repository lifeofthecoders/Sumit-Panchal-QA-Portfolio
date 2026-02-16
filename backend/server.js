import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";

import blogsRouter from "./src/routes/blogs.js";

dotenv.config();

const app = express();

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;
const CORS_ORIGIN = process.env.CORS_ORIGIN || "*";

/* Middleware */
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Support multiple origins (comma-separated) and provide a safe CORS policy
const rawCors = process.env.CORS_ORIGIN || "*";
const allowedOrigins = rawCors.split(",").map((s) => s.trim()).filter(Boolean);
console.log("CORS configured allowed origins:", allowedOrigins);

app.use((req, res, next) => {
  const origin = req.headers.origin;

  // If no origin (server-to-server or local tools), allow by default
  if (!origin) {
    res.setHeader("Access-Control-Allow-Origin", allowedOrigins.includes("*") ? "*" : allowedOrigins[0]);
  } else if (allowedOrigins.includes("*") || allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }

  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
  // allow credentials only when explicitly set
  res.setHeader("Access-Control-Allow-Credentials", "false");

  // Handle preflight quickly
  if (req.method === "OPTIONS") return res.sendStatus(204);

  next();
});

/* Health */
app.get("/api/health", (req, res) => {
  res.json({ ok: true, message: "Backend is running" });
});

/* Routes */
app.use("/api/blogs", blogsRouter);

/* Start */
const start = async () => {
  try {
    if (!MONGODB_URI) {
      console.error("❌ MONGODB_URI is missing in backend/.env");
      process.exit(1);
    }

    await mongoose.connect(MONGODB_URI);
    console.log("✅ MongoDB connected");

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("❌ Failed to start server:", err);
    process.exit(1);
  }
};

start();

// Global error handlers to log crashes (helpful on platforms like Render)
process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION:", err && err.stack ? err.stack : err);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("UNHANDLED REJECTION at:", promise, "reason:", reason);
});
