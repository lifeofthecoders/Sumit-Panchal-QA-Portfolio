
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import Admin from "../models/Admin.js";

const JWT_SECRET = process.env.JWT_SECRET;

/* =========================
   JWT CONFIGURATION
========================= */
const isJwtConfigured = () =>
  typeof JWT_SECRET === "string" && JWT_SECRET.length >= 32;

/* =========================
   VERIFY ADMIN AUTHENTICATION
========================= */
export const verifyAdmin = async (req, res, next) => {
  try {
    // 1. Require a valid JWT configuration.
    if (!isJwtConfigured()) {
      console.error("JWT_SECRET is missing or too weak.");

      return res.status(503).json({
        success: false,
        message: "Authentication service is not configured correctly",
      });
    }

    // 2. Require an active MongoDB connection.
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        message: "Authentication service is temporarily unavailable",
      });
    }

    // 3. Require a Bearer token.
    const authHeader = req.headers.authorization;

    if (
      typeof authHeader !== "string" ||
      !authHeader.startsWith("Bearer ")
    ) {
      return res.status(401).json({
        success: false,
        message: "Authentication required. Please log in.",
      });
    }

    const token = authHeader.slice(7).trim();

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication token is missing",
      });
    }

    // 4. Verify token signature, expiry and algorithm.
    let decoded;

    try {
      decoded = jwt.verify(token, JWT_SECRET, {
        algorithms: ["HS256"],
      });
    } catch (jwtError) {
      return res.status(401).json({
        success: false,
        message:
          jwtError.name === "TokenExpiredError"
            ? "Session expired. Please log in again."
            : "Invalid authentication token",
      });
    }

    // 5. Require the expected token claims.
    if (
      !decoded ||
      typeof decoded !== "object" ||
      typeof decoded.id !== "string" ||
      !mongoose.Types.ObjectId.isValid(decoded.id) ||
      !Number.isInteger(decoded.tokenVersion) ||
      !["admin", "superadmin"].includes(decoded.role)
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid authentication token",
      });
    }

    // 6. Find the actual administrator in MongoDB.
    // No fallback accounts and no automatic account creation.
    const admin = await Admin.findById(decoded.id)
      .select("+tokenVersion");

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Administrator account not found",
      });
    }

    // 7. Confirm the token still belongs to this account.
    if (
      decoded.tokenVersion !== (admin.tokenVersion || 0)
    ) {
      return res.status(401).json({
        success: false,
        message: "Session invalidated. Please log in again.",
      });
    }

    // 8. Confirm the role has not changed.
    if (decoded.role !== admin.role) {
      return res.status(403).json({
        success: false,
        message: "Administrator permissions have changed",
      });
    }

    // 9. Attach verified administrator information.
    req.admin = {
      id: admin._id.toString(),
      role: admin.role,
    };

    return next();
  } catch (error) {
    console.error("Admin authentication error:", error.message);

    // Fail closed if database verification or another
    // authentication operation fails.
    if (error.name === "MongoServerError" ||
        error.name === "MongooseError" ||
        error.name === "MongoNetworkError") {
      return res.status(503).json({
        success: false,
        message: "Authentication service is temporarily unavailable",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to verify administrator authentication",
    });
  }
};
