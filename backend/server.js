import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";
import cookieParser from "cookie-parser";
import {
  requireDatabase,
  setDatabaseConnected,
} from "./src/middlewares/requireDatabase.js";

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
const { default: adminAuthRoutes } = await import(
  "./src/routes/adminAuth.route.js"
);

const app = express();

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;
const LOCAL_MONGODB_URI =
  process.env.LOCAL_MONGODB_URI ||
  "mongodb://127.0.0.1:27017/qa_portfolio";

let dbConnected = false;

/* =========================================================
   PROFESSIONAL API STATUS PAGE HELPERS
   Browser requests receive HTML.
   API clients continue receiving JSON.
   ========================================================= */

const wantsHtmlPage = (req) =>
  (req.get("accept") || "")
    .toLowerCase()
    .includes("text/html");

/* =========================
   HTML Escape Utility
   ========================= */
const escapeHtml = (value = "") =>
  String(value).replace(/[&<>"']/g, (char) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };

    return entities[char];
  });

/* =========================
   Server Uptime Formatter
   ========================= */
const formatUptime = (seconds) => {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  return `${days}d ${hours}h ${minutes}m ${remainingSeconds}s`;
};

/* =========================
   Information Grid Item
   ========================= */
const infoItem = (label, value, className = "") => `
  <div>
    <span class="info-label">${escapeHtml(label)}</span>
    <div class="info-value ${escapeHtml(className)}">
      ${escapeHtml(value)}
    </div>
  </div>
`;

/* =========================
   Endpoint Link Item
   ========================= */
const endpointItem = (href, label, method = "GET") => `
  <div class="endpoint">
    <a href="${escapeHtml(href)}">${escapeHtml(label)}</a>
    <span class="method">${escapeHtml(method)}</span>
  </div>
`;

/* =========================
   Reusable HTML Status Page
   ========================= */
const renderApiStatusPage = ({
  badge = "BACKEND API SERVICES",
  title = "QA Portfolio API",
  subtitle = "Quality Assurance Portfolio",
  description = "Reliable backend services for the QA Portfolio application.",
  statusHealthy = true,
  sections = [],
  footer = "QA Portfolio API",
}) => {
  const statusColor = statusHealthy ? "#35e88a" : "#ff6464";

  const sectionMarkup = sections
    .map(
      (section) => `
        <section class="panel">
          <h2>${escapeHtml(section.title)}</h2>
          ${section.content}
        </section>
      `
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="theme-color" content="#080d1b" />
  <meta
    name="description"
    content="${escapeHtml(description)}"
  />

  <title>${escapeHtml(title)} | Sumit Panchal</title>

  <style>
    * {
      box-sizing: border-box;
    }

    html {
      min-height: 100%;
      background: #080d1b;
    }

    body {
      margin: 0;
      min-height: 100vh;
      padding: 32px 20px;
      background: #080d1b;
      color: #f5f7ff;
      font-family:
        Inter,
        -apple-system,
        BlinkMacSystemFont,
        "Segoe UI",
        Roboto,
        Arial,
        sans-serif;
    }

    .container {
      width: 100%;
      max-width: 905px;
      margin: 0 auto;
    }

    .hero {
      margin: 0 auto 40px;
      text-align: center;
    }

    .badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 9px 17px;
      margin-bottom: 18px;
      border: 1px solid #15516b;
      border-radius: 30px;
      background: #0c2535;
      color: #29c7ff;
      font-size: 12px;
      font-weight: 500;
      letter-spacing: .35px;
    }

    h1 {
      margin: 0 0 15px;
      color: #f5f7ff;
      font-size: clamp(34px, 6vw, 50px);
      font-weight: 750;
      letter-spacing: -1.5px;
      line-height: 1.15;
    }

    .subtitle {
      margin: 0 0 7px;
      color: #a6b4c9;
      font-size: 16px;
      line-height: 1.5;
    }

    .description {
      margin: 0;
      color: #a6b4c9;
      font-size: 16px;
      line-height: 1.6;
    }

    .panel {
      padding: 25px 26px;
      margin-bottom: 19px;
      border: 1px solid #263650;
      border-radius: 18px;
      background: #121c30;
    }

    .panel h2 {
      margin: 0 0 20px;
      color: #f5f7ff;
      font-size: 18px;
      font-weight: 700;
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 23px 30px;
    }

    .info-label {
      display: block;
      margin-bottom: 7px;
      color: #96a5bb;
      font-size: 12px;
      font-weight: 400;
      letter-spacing: .25px;
      text-transform: uppercase;
    }

    .info-value {
      color: #f5f7ff;
      font-size: 15px;
      font-weight: 650;
      line-height: 1.5;
      overflow-wrap: anywhere;
    }

    .healthy {
      color: #35e88a;
    }

    .unhealthy {
      color: #ff6464;
    }

    .endpoint-list {
      display: flex;
      flex-direction: column;
    }

    .endpoint {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 15px;
      padding: 15px 0;
      border-bottom: 1px solid #263650;
    }

    .endpoint:first-child {
      padding-top: 7px;
    }

    .endpoint:last-child {
      padding-bottom: 0;
      border-bottom: none;
    }

    .endpoint a {
      color: #29c7ff;
      font-family: Consolas, monospace;
      font-size: 14px;
      text-decoration: none;
      overflow-wrap: anywhere;
    }

    .endpoint a:hover {
      color: #7de0ff;
      text-decoration: underline;
    }

    .method {
      flex-shrink: 0;
      color: #35e88a;
      font-size: 12px;
      font-weight: 750;
      text-transform: uppercase;
    }

    .footer {
      padding-top: 14px;
      color: #71829d;
      font-size: 13px;
      line-height: 1.9;
      text-align: center;
    }

    .footer strong {
      color: #a6b4c9;
      font-weight: 600;
    }

    @media (max-width: 600px) {
      body {
        padding: 25px 14px;
      }

      .hero {
        margin-bottom: 28px;
      }

      .panel {
        padding: 21px 18px;
        border-radius: 15px;
      }

      .info-grid {
        gap: 20px 14px;
      }

      .endpoint {
        align-items: flex-start;
      }

      .endpoint a {
        font-size: 13px;
      }
    }
  </style>
</head>

<body>
  <main class="container">

    <header class="hero">
      <div class="badge">✦ ${escapeHtml(badge)}</div>

      <h1>${escapeHtml(title)}</h1>

      <p class="subtitle">${escapeHtml(subtitle)}</p>

      <p class="description">
        ${escapeHtml(description)}
      </p>
    </header>

    ${sectionMarkup}

    <footer class="footer">
      <div>Developed by <strong>Sumit Panchal</strong></div>
      <div>${escapeHtml(footer)}</div>
    </footer>

  </main>
</body>
</html>`;
};

/* =========================
   HTML Response Helper
   ========================= */
const sendHtmlPage = (res, html, statusCode = 200) => {
  res.set("Cache-Control", "no-store");
  return res.status(statusCode).type("html").send(html);
};

/* =========================================================
   ✅ PERMANENT PREFLIGHT FIX (DO NOT REMOVE)
   ========================================================= */
app.use((req, res, next) => {
  res.header(
    "Access-Control-Allow-Origin",
    req.headers.origin || "*"
  );

  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );

  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );

  res.header("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});

/* =========================
   Parse Allowed CORS Origins
   ========================= */
const rawCors = process.env.CORS_ORIGIN || "";

const allowedOrigins = rawCors
  .split(",")
  .map((s) => s.trim().replace(/\/$/, ""))
  .filter(Boolean);

/* ✅ FIXED HERE — ADDED LOCALHOST */
allowedOrigins.push(
  "https://lifeofthecoders.github.io",
  "http://localhost:5173",
  "http://127.0.0.1:5173"
);

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
   Cookie Parser
   ========================= */
app.use(cookieParser());

/* =========================
   Serve static files for uploads & default images
   (Critical for profile pic fallback & default avatar)
   ========================= */
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use(
  "/image",
  express.static(path.join(__dirname, "public/image"))
);

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

/* =========================================================
   ROOT API OVERVIEW
   GET /
   HTML for browsers | JSON for API clients
   ========================================================= */
app.get("/", (req, res) => {
  const databaseReady =
    mongoose.connection.readyState === 1 && dbConnected;

  const cloudinaryConfigured = Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );

  if (!wantsHtmlPage(req)) {
    return res.status(200).json({
      ok: true,
      service: "qa-portfolio-backend",
      developer: "Sumit Panchal",
      application: "QA Portfolio",
      status: "operational",
      endpoints: {
        health: "/api/health",
        cloudinaryHealth: "/api/cloudinary-health",
        blogs: "/api/blogs",
        admin: "/api/admin",
      },
    });
  }

  const sections = [
    {
      title: "System Information",
      content: `
        <div class="info-grid">
          ${infoItem(
            "API STATUS",
            databaseReady ? "Operational" : "Degraded",
            databaseReady ? "healthy" : "unhealthy"
          )}

          ${infoItem("DEVELOPER", "Sumit Panchal")}

          ${infoItem("APPLICATION", "QA Portfolio")}

          ${infoItem("API TYPE", "REST API")}

          ${infoItem(
            "DATABASE",
            databaseReady ? "Connected" : "Disconnected",
            databaseReady ? "healthy" : "unhealthy"
          )}

          ${infoItem(
            "CLOUDINARY",
            cloudinaryConfigured ? "Configured" : "Not Configured",
            cloudinaryConfigured ? "healthy" : "unhealthy"
          )}
        </div>
      `,
    },
    {
      title: "Available API Endpoints",
      content: `
        <div class="endpoint-list">
          ${endpointItem("/", "API Home")}
          ${endpointItem("/api/health", "/api/health")}
          ${endpointItem(
            "/api/cloudinary-health",
            "/api/cloudinary-health"
          )}
          ${endpointItem("/api/blogs", "/api/blogs")}
          ${endpointItem("/api/admin", "/api/admin")}
        </div>
      `,
    },
  ];

  const html = renderApiStatusPage({
    badge: "BACKEND API SERVICES",
    title: "QA Portfolio API",
    subtitle: "Sumit Panchal · Quality Assurance Portfolio",
    description:
      "Reliable backend services for portfolio content, administration, database operations, and media management.",
    statusHealthy: databaseReady,
    sections,
    footer: "QA Portfolio API · Backend service overview",
  });

  return sendHtmlPage(res, html);
});

/* =========================================================
   BACKEND DATABASE HEALTH
   GET /api/health
   ========================================================= */
app.get("/api/health", (req, res) => {
  const databaseReady =
    mongoose.connection.readyState === 1 && dbConnected;

  const statusCode = databaseReady ? 200 : 503;

  const response = {
    ok: databaseReady,
    service: "qa-portfolio-backend",
    message: databaseReady
      ? "Backend and database are ready"
      : "Backend is running, but the database is not connected",
    database: {
      connected: databaseReady,
      state: mongoose.connection.readyState,
    },
  };

  /* Preserve JSON response for API clients */
  if (!wantsHtmlPage(req)) {
    return res.status(statusCode).json(response);
  }

  const sections = [
    {
      title: "System Status",
      content: `
        <div class="info-grid">
          ${infoItem(
            "CURRENT STATUS",
            databaseReady ? "Healthy" : "Degraded",
            databaseReady ? "healthy" : "unhealthy"
          )}

          ${infoItem(
            "SERVER UPTIME",
            formatUptime(process.uptime())
          )}

          ${infoItem(
            "LAST CHECKED (UTC)",
            new Date().toISOString()
          )}

          ${infoItem(
            "SERVICE",
            "QA Portfolio Backend"
          )}
        </div>
      `,
    },
    {
      title: "Database Information",
      content: `
        <div class="info-grid">
          ${infoItem(
            "DATABASE STATUS",
            databaseReady ? "Connected" : "Disconnected",
            databaseReady ? "healthy" : "unhealthy"
          )}

          ${infoItem(
            "CONNECTION STATE",
            String(mongoose.connection.readyState)
          )}

          ${infoItem("API ENDPOINT", "/api/health")}

          ${infoItem(
            "HTTP RESPONSE",
            databaseReady
              ? "200 OK"
              : "503 Service Unavailable"
          )}
        </div>
      `,
    },
    {
      title: "Related Endpoints",
      content: `
        <div class="endpoint-list">
          ${endpointItem("/", "API Home")}
          ${endpointItem(
            "/api/cloudinary-health",
            "/api/cloudinary-health"
          )}
        </div>
      `,
    },
  ];

  const html = renderApiStatusPage({
    badge: "LIVE SYSTEM MONITORING",
    title: "System Health",
    subtitle: "QA Portfolio Backend",
    description:
      "Real-time backend and MongoDB service health information.",
    statusHealthy: databaseReady,
    sections,
    footer: `QA Portfolio API · ${
      databaseReady ? "Database operational" : "Database unavailable"
    }`,
  });

  return sendHtmlPage(res, html, statusCode);
});

/* =========================================================
   CLOUDINARY SERVICE HEALTH
   GET /api/cloudinary-health
   ========================================================= */
app.get("/api/cloudinary-health", async (req, res) => {
  const configured = Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );

  if (!configured) {
    const response = {
      ok: false,
      message: "Cloudinary credentials missing",
    };

    if (!wantsHtmlPage(req)) {
      return res.status(503).json(response);
    }

    const sections = [
      {
        title: "Cloudinary Service Status",
        content: `
          <div class="info-grid">
            ${infoItem(
              "CURRENT STATUS",
              "Not Configured",
              "unhealthy"
            )}

            ${infoItem("SERVICE", "Cloudinary")}

            ${infoItem(
              "LAST CHECKED (UTC)",
              new Date().toISOString()
            )}

            ${infoItem(
              "HTTP RESPONSE",
              "503 Service Unavailable"
            )}
          </div>
        `,
      },
      {
        title: "Media Service Information",
        content: `
          <div class="info-grid">
            ${infoItem(
              "CONFIGURATION",
              "Credentials Missing",
              "unhealthy"
            )}

            ${infoItem(
              "CONNECTION TEST",
              "Not Performed",
              "unhealthy"
            )}

            ${infoItem(
              "API ENDPOINT",
              "/api/cloudinary-health"
            )}

            ${infoItem("MEDIA PROVIDER", "Cloudinary")}
          </div>
        `,
      },
      {
        title: "Related Endpoints",
        content: `
          <div class="endpoint-list">
            ${endpointItem("/", "API Home")}
            ${endpointItem("/api/health", "/api/health")}
          </div>
        `,
      },
    ];

    const html = renderApiStatusPage({
      badge: "LIVE MEDIA SERVICE MONITORING",
      title: "Cloudinary Health",
      subtitle: "QA Portfolio Media Service",
      description:
        "Cloudinary configuration and live media service connectivity information.",
      statusHealthy: false,
      sections,
      footer: "QA Portfolio API · Cloudinary not configured",
    });

    return sendHtmlPage(res, html, 503);
  }

  try {
    await cloudinary.api.ping();

    const response = {
      ok: true,
      message: "Cloudinary connected successfully",
    };

    /* Preserve JSON response for API clients */
    if (!wantsHtmlPage(req)) {
      return res.status(200).json(response);
    }

    const sections = [
      {
        title: "Cloudinary Service Status",
        content: `
          <div class="info-grid">
            ${infoItem(
              "CURRENT STATUS",
              "Connected",
              "healthy"
            )}

            ${infoItem("SERVICE", "Cloudinary")}

            ${infoItem(
              "LAST CHECKED (UTC)",
              new Date().toISOString()
            )}

            ${infoItem("HTTP RESPONSE", "200 OK")}
          </div>
        `,
      },
      {
        title: "Media Service Information",
        content: `
          <div class="info-grid">
            ${infoItem(
              "CONFIGURATION",
              "Credentials Available",
              "healthy"
            )}

            ${infoItem(
              "CONNECTION TEST",
              "Ping Successful",
              "healthy"
            )}

            ${infoItem(
              "API ENDPOINT",
              "/api/cloudinary-health"
            )}

            ${infoItem("MEDIA PROVIDER", "Cloudinary")}
          </div>
        `,
      },
      {
        title: "Related Endpoints",
        content: `
          <div class="endpoint-list">
            ${endpointItem("/", "API Home")}
            ${endpointItem("/api/health", "/api/health")}
          </div>
        `,
      },
    ];

    const html = renderApiStatusPage({
      badge: "LIVE MEDIA SERVICE MONITORING",
      title: "Cloudinary Health",
      subtitle: "QA Portfolio Media Service",
      description:
        "Cloudinary configuration and live media service connectivity information.",
      statusHealthy: true,
      sections,
      footer: "QA Portfolio API · Cloudinary operational",
    });

    return sendHtmlPage(res, html, 200);
  } catch (err) {
    console.error(
      "❌ Cloudinary health check failed:",
      err.message
    );

    const response = {
      ok: false,
      message: "Cloudinary connection failed",
      error: err.message,
    };

    /* Preserve original JSON response for API clients */
    if (!wantsHtmlPage(req)) {
      return res.status(503).json(response);
    }

    const sections = [
      {
        title: "Cloudinary Service Status",
        content: `
          <div class="info-grid">
            ${infoItem(
              "CURRENT STATUS",
              "Connection Failed",
              "unhealthy"
            )}

            ${infoItem("SERVICE", "Cloudinary")}

            ${infoItem(
              "LAST CHECKED (UTC)",
              new Date().toISOString()
            )}

            ${infoItem(
              "HTTP RESPONSE",
              "503 Service Unavailable"
            )}
          </div>
        `,
      },
      {
        title: "Media Service Information",
        content: `
          <div class="info-grid">
            ${infoItem(
              "CONFIGURATION",
              "Credentials Available",
              "healthy"
            )}

            ${infoItem(
              "CONNECTION TEST",
              "Ping Failed",
              "unhealthy"
            )}

            ${infoItem(
              "API ENDPOINT",
              "/api/cloudinary-health"
            )}

            ${infoItem("MEDIA PROVIDER", "Cloudinary")}
          </div>
        `,
      },
      {
        title: "Related Endpoints",
        content: `
          <div class="endpoint-list">
            ${endpointItem("/", "API Home")}
            ${endpointItem("/api/health", "/api/health")}
          </div>
        `,
      },
    ];

    const html = renderApiStatusPage({
      badge: "LIVE MEDIA SERVICE MONITORING",
      title: "Cloudinary Health",
      subtitle: "QA Portfolio Media Service",
      description:
        "Cloudinary configuration and live media service connectivity information.",
      statusHealthy: false,
      sections,
      footer: "QA Portfolio API · Cloudinary unavailable",
    });

    return sendHtmlPage(res, html, 503);
  }
});

/* =========================
   Routes
   ========================= */
app.use("/api/blogs", requireDatabase, blogsRouter);
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
  const connectToDatabase = async (uri) => {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 30000,
      connectTimeoutMS: 30000,
    });

    dbConnected = true;
    setDatabaseConnected(true);

    console.log(
      "✅ 📯🎉MongoDB connected successfully...!🎉📯"
    );
  };

  const seedDefaultAdmin = async () => {
    try {
      const Admin = (
        await import("./src/models/Admin.js")
      ).default;

      const existing = await Admin.findOne({
        email: "sumitpanchal2552@gmail.com",
      });

      if (!existing) {
        await Admin.create({
          name: "Sumit Panchal",
          email: "sumitpanchal2552@gmail.com",
          password: "Sumit@2552", // Existing seed behavior retained
          phone: "",
          isVerified: true,
        });

        console.log(
          "🎉 Default admin account created automatically 📯"
        );
      } else {
        console.log(
          "⚠️ 📯Default admin already exists...!📯"
        );
      }
    } catch (seedErr) {
      console.error(
        "⚠️ Admin seeding failed:",
        seedErr.message
      );
    }
  };

  const startServer = () => {
    const server = app.listen(PORT, () => {
      console.log("=======================================");
      console.log(
        `🚀 Server established successfully on port ${PORT}`
      );
      console.log(`🌍 Local: http://localhost:${PORT}`);
      console.log("=======================================");
    });

    server.on("error", (err) => {
      if (err.code === "EADDRINUSE") {
        console.error(
          `❌ Port ${PORT} is already in use. Stop the other process or set a different PORT.`
        );

        process.exit(1);
      }

      console.error("❌ Server error:", err);
      process.exit(1);
    });
  };

  const tryDatabaseConnection = async (uri, label) => {
    try {
      console.log(`🔎 Trying MongoDB connection: ${label}`);

      await connectToDatabase(uri);

      console.log(`✅ Connected to MongoDB via ${label}`);

      return true;
    } catch (connectErr) {
      console.warn(
        `⚠️ MongoDB connection failed for ${label}:`,
        connectErr.message
      );

      return false;
    }
  };

  try {
    const primaryConnected = await tryDatabaseConnection(
      MONGODB_URI,
      "Atlas"
    );

    if (!primaryConnected) {
      const localConnected = await tryDatabaseConnection(
        LOCAL_MONGODB_URI,
        "Local"
      );

      if (!localConnected) {
        dbConnected = false;
        setDatabaseConnected(false);

        console.error(
          "❌ Both Atlas and local MongoDB connections failed. Backend will start in degraded mode."
        );

        console.log(
          "⚠️ Admin login fallback is enabled. /api/blogs will remain unavailable until MongoDB is restored."
        );

        startServer();
        return;
      }
    }

    await seedDefaultAdmin();
    startServer();
  } catch (err) {
    dbConnected = false;
    setDatabaseConnected(false);

    console.error(
      "❌ Unexpected startup error:",
      err.message || err
    );

    startServer();
  }
};

start();

/* =========================
   Graceful Shutdown
   ========================= */
process.on("SIGTERM", async () => {
  console.log(
    "⚠️ SIGTERM received. Shutting down gracefully..."
  );

  await mongoose.connection.close(false);
  process.exit(0);
});

process.on("uncaughtException", (err) => {
  console.error(
    "❌ UNCAUGHT EXCEPTION:",
    err.stack || err
  );

  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error(
    "❌ UNHANDLED REJECTION at:",
    promise,
    "reason:",
    reason
  );
});
