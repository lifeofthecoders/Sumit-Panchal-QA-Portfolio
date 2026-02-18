import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

// Load .env from backend folder
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, ".env") });

// Dynamic imports after dotenv
const { default: blogsRouter } = await import("./src/routes/blogs.js");
const { default: cloudinary } = await import("./src/config/cloudinary.js");

const app = express();

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

// Parse allowed CORS origins
const rawCors = process.env.CORS_ORIGIN || "*";
const allowedOrigins = rawCors
  .split(",")
  .map(s => s.trim().replace(/\/$/, ""))
  .filter(Boolean);

console.log("CORS allowed origins:", allowedOrigins);

/* =========================
   Timeout Middleware
   ========================= */
app.use((req, res, next) => {
  req.setTimeout(300000); // 5 minutes
  res.setTimeout(300000);
  next();
});

/* =========================
   Body Parser
   ========================= */
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

/* =========================
   CORS Configuration
   ========================= */
const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes("*")) {
      return callback(null, true);
    }

    const cleanOrigin = origin.replace(/\/$/, "");
    if (allowedOrigins.includes(cleanOrigin)) {
      return callback(null, true);
    }

    console.log(`CORS blocked: ${cleanOrigin}`);
    callback(new Error("Not allowed by CORS"));
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept", "Origin"],
  credentials: false,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

/* =========================
   Health Endpoints
   ========================= */
app.get("/api/health", (req, res) => {
  res.status(200).json({ ok: true, message: "Backend is running" });
});

app.get("/api/cloudinary-health", async (req, res) => {
  const configured = Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );

  if (!configured) {
    return res.status(503).json({
      ok: false,
      message: "Cloudinary credentials missing",
    });
  }

  try {
    // Lightweight check — just ping usage stats
    await cloudinary.api.usage();
    res.status(200).json({ ok: true, message: "Cloudinary connected" });
  } catch (err) {
    console.error("Cloudinary health check failed:", err.message);
    res.status(503).json({
      ok: false,
      message: "Cloudinary connection failed",
      error: err.message,
    });
  }
});

/* =========================
   Routes
   ========================= */
app.use("/api/blogs", blogsRouter);

/* =========================
   Serve temporary uploads (fallback)
   ========================= */
const uploadsDir = path.join(process.cwd(), "public", "uploads");

if (!fs.existsSync(uploadsDir)) {
  try {
    fs.mkdirSync(uploadsDir, { recursive: true });
  } catch (err) {
    console.warn("Could not create uploads directory:", err.message);
  }
}

app.use("/uploads", express.static(uploadsDir));

/* =========================
   404 Handler
   ========================= */
app.use((req, res) => {
  res.status(404).json({
    ok: false,
    message: "Route not found",
  });
});

/* =========================
   Global Error Handler
   ========================= */
app.use((err, req, res, next) => {
  console.error("Server error:", err.stack || err);
  const status = err.status || 500;
  res.status(status).json({
    ok: false,
    message: status === 500 ? "Internal server error" : err.message || "Server error",
  });
});

/* =========================
   Server Startup
   ========================= */
const start = async () => {
  if (!MONGODB_URI) {
    console.error("MONGODB_URI is missing in environment variables");
    process.exit(1);
  }

  try {
    await mongoose.connect(MONGODB_URI);
    console.log("MongoDB connected successfully");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err.message);
    process.exit(1);
  }
};

start();

/* =========================
   Graceful shutdown
   ========================= */
process.on("SIGTERM", () => {
  console.log("SIGTERM received. Shutting down gracefully...");
  mongoose.connection.close(false).then(() => {
    console.log("MongoDB connection closed.");
    process.exit(0);
  });
});

process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION:", err.stack || err);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("UNHANDLED REJECTION at:", promise, "reason:", reason);
  process.exit(1);
});