import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";

import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

// ✅ FIX: Always load backend/.env even if server is started from root folder
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, ".env") });

/**
 * ✅ IMPORTANT FIX:
 * In ESM, static imports run before dotenv.config().
 * So we must import cloudinary + routes AFTER dotenv loads.
 */
const { default: blogsRouter } = await import("./src/routes/blogs.js");
const { default: cloudinary } = await import("./src/config/cloudinary.js");

const app = express();

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

// Support multiple origins (comma-separated)
const rawCors = process.env.CORS_ORIGIN || "*";
const allowedOrigins = rawCors
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

console.log("CORS configured allowed origins:", allowedOrigins);

/* =========================
   Timeout Middleware (Fix 408 during upload)
   ========================= */
app.use((req, res, next) => {
  // Cloudinary uploads + cold starts can be slow on Render
  req.setTimeout(300000); // 5 minutes
  res.setTimeout(300000);
  next();
});

/* =========================
   Body Middleware
   ========================= */
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

/* =========================
   CORS (Correct + stable)
   ========================= */

// ✅ Make a single CORS config and reuse it for BOTH normal requests and preflight
const corsOptions = {
  origin: function (origin, callback) {
    // Allow server-to-server / curl / postman
    if (!origin) return callback(null, true);

    // Allow all (not recommended, but supported)
    if (allowedOrigins.includes("*")) return callback(null, true);

    // Allow specific origins
    if (allowedOrigins.includes(origin)) return callback(null, true);

    console.log("❌ Blocked by CORS:", origin);
    return callback(new Error("Not allowed by CORS"));
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

// Apply cors for all routes
app.use(cors(corsOptions));

// ✅ FIX: Preflight must use SAME corsOptions (this was your bug)
app.options("*", cors(corsOptions));

/* =========================
   Health
   ========================= */
app.get("/api/health", (req, res) => {
  res.json({ ok: true, message: "Backend is running" });
});

// Cloudinary health check: verifies env vars and attempts a lightweight API call
app.get("/api/cloudinary-health", async (req, res) => {
  const configured = !!(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );

  if (!configured) {
    return res.status(503).json({
      ok: false,
      configured: false,
      message: "Cloudinary env vars are missing",
    });
  }

  try {
    const result = await cloudinary.api.resources({ max_results: 1 });
    return res.status(200).json({
      ok: true,
      configured: true,
      cloudinaryInfo: { total_count: result && result.total_count },
      message: "Cloudinary reachable",
    });
  } catch (err) {
    console.error(
      "Cloudinary health check failed:",
      err && err.message ? err.message : err
    );
    return res.status(503).json({
      ok: false,
      configured: true,
      message: "Cloudinary auth or API error",
      error: err && err.message ? err.message : String(err),
    });
  }
});

/* =========================
   Routes
   ========================= */
app.use("/api/blogs", blogsRouter);

/* =========================
   Serve temporary uploaded files (fallback)
   ========================= */
const uploadsDir = path.join(process.cwd(), "public", "uploads");

try {
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
} catch (err) {
  console.warn(
    "Failed to ensure uploads directory exists:",
    err && err.message ? err.message : err
  );
}

app.use("/uploads", express.static(uploadsDir));

/* =========================
   Start
   ========================= */
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

/* =========================
   Global error handlers
   ========================= */
process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION:", err && err.stack ? err.stack : err);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("UNHANDLED REJECTION at:", promise, "reason:", reason);
});
