import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";
import cookieParser from "cookie-parser"; // ✅ NEW

/* =========================
   Load Environment Variables
   ========================= */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, ".env") });

/* =========================
   Dynamic Imports (after dotenv)
   ========================= */
const { default: blogsRouter } = await import("./src/routes/blogs.js");
const { default: cloudinary } = await import("./src/config/cloudinary.js");

// ✅ NEW: Admin Auth Routes
const { default: adminAuthRoutes } = await import(
  "./src/routes/adminAuth.route.js"
);

const app = express();

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

/* =========================
   Parse Allowed CORS Origins
   ========================= */
const rawCors = process.env.CORS_ORIGIN || "";
const allowedOrigins = rawCors
  .split(",")
  .map((s) => s.trim().replace(/\/$/, ""))
  .filter(Boolean);

// Always allow your frontend explicitly
allowedOrigins.push("https://lifeofthecoders.github.io");

/* =========================
   Timeout Middleware
   ========================= */
app.use((req, res, next) => {
  req.setTimeout(300000);
  res.setTimeout(300000);
  next();
});

/* =========================
   Body Parser
   ========================= */
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

/* =========================
   Cookie Parser (Required for JWT)
   ========================= */
app.use(cookieParser()); // ✅ NEW

/* =========================
   CORS Configuration
   ========================= */
const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);

    const cleanOrigin = origin.replace(/\/$/, "");

    if (allowedOrigins.includes(cleanOrigin)) {
      return callback(null, true);
    }

    return callback(new Error("Not allowed by CORS"));
  },

  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
    "Origin",
  ],

  credentials: true,
  optionsSuccessStatus: 200,
};

/* =========================
   Apply CORS
   ========================= */
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

/* =========================
   Health Endpoints
   ========================= */
app.get("/api/health", (req, res) => {
  return res.status(200).json({
    ok: true,
    message: "Backend is running",
  });
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
    await cloudinary.api.ping();
    return res.status(200).json({
      ok: true,
      message: "Cloudinary connected successfully",
    });
  } catch (err) {
    console.error("❌ Cloudinary health check failed:", err.message);
    return res.status(503).json({
      ok: false,
      message: "Cloudinary connection failed",
      error: err.message,
    });
  }
});

/* =========================
   Routes
   ========================= */

// ✅ Existing Blog Routes (UNCHANGED)
app.use("/api/blogs", blogsRouter);

// ✅ NEW: Admin Auth Routes
app.use("/api/admin", adminAuthRoutes);

/* =========================
   404 Handler
   ========================= */
app.use((req, res) => {
  return res.status(404).json({
    ok: false,
    message: "Route not found",
  });
});

/* =========================
   Global Error Handler
   ========================= */
app.use((err, req, res, next) => {
  console.error("❌ Server error:", err.stack || err);

  if (err.message && err.message.includes("Not allowed by CORS")) {
    return res.status(403).json({
      ok: false,
      message: "CORS blocked this request",
      error: err.message,
    });
  }

  const status = err.status || 500;

  return res.status(status).json({
    ok: false,
    message:
      status === 500
        ? "Internal server error"
        : err.message || "Server error",
  });
});

/* =========================
   Server Startup
   ========================= */
const start = async () => {
  if (!MONGODB_URI) {
    console.error("❌ MONGODB_URI is missing in environment variables");
    process.exit(1);
  }

  try {
    // console.log("MONGODB_URI =", MONGODB_URI);
    await mongoose.connect(MONGODB_URI, {
      tls: true,
      serverSelectionTimeoutMS: 30000,
    });
    console.log("✅ 🎉MongoDB connected successfully...!🎉");

    // ---------- default admin seeding ----------
    try {
      const Admin = (await import("./src/models/Admin.js")).default;
      const bcrypt = await import("bcryptjs");
      const existing = await Admin.findOne({
        email: "sumitpanchal2552@gmail.com",
      });
      if (!existing) {
        const hashed = await bcrypt.hash("Sumit@2552", 10);
        await Admin.create({
          name: "Sumit Panchal",
          email: "sumitpanchal2552@gmail.com",
          password: hashed,
          phone: "",
          isVerified: true,
        });
        console.log("🎉 Default admin account created automatically");
      } else {
        console.log("⚠️ Default admin already exists...!");
      }
    } catch (seedErr) {
      console.error("⚠️ Admin seeding failed:", seedErr.message);
    }

    app.listen(PORT, () => {
      console.log("=======================================");
      console.log(`🚀 Server established successfully 🚀`);
      console.log(`🌍 Running on: http://localhost:${PORT}`);
      console.log("=======================================");
    });
  } catch (err) {
    console.error("❌ Failed to start server:", err.message);
    process.exit(1);
  }
};

start();

/* =========================
   Graceful Shutdown
   ========================= */
process.on("SIGTERM", async () => {
  console.log("⚠️ SIGTERM received. Shutting down gracefully...");
  await mongoose.connection.close(false);
  process.exit(0);
});

process.on("uncaughtException", (err) => {
  console.error("❌ UNCAUGHT EXCEPTION:", err.stack || err);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ UNHANDLED REJECTION at:", promise, "reason:", reason);
  process.exit(1);
});