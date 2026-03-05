import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";

const JWT_SECRET = process.env.JWT_SECRET;

/* Security Check */
if (!JWT_SECRET || JWT_SECRET.length < 32) {
  if (process.env.NODE_ENV === "production") {
    console.error("CRITICAL: JWT_SECRET missing or weak.");
    process.exit(1);
  } else {
    console.warn("Warning: Weak JWT_SECRET in development.");
  }
}

export const verifyAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authentication required – no token provided",
      });
    }

    const token = authHeader.split(" ")[1];

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (jwtError) {
      if (jwtError.name === "TokenExpiredError") {
        return res.status(401).json({
          success: false,
          message: "Session expired – please log in again",
        });
      }

      return res.status(401).json({
        success: false,
        message: "Invalid authentication token",
      });
    }

    const admin = await Admin.findById(decoded.id).select("+tokenVersion");

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Admin account no longer exists",
      });
    }

    if (
      typeof decoded.tokenVersion !== "undefined" &&
      decoded.tokenVersion !== admin.tokenVersion
    ) {
      return res.status(401).json({
        success: false,
        message: "Session invalidated. Please log in again.",
      });
    }

    req.admin = {
      id: admin._id,
      role: admin.role,
    };

    next();

  } catch (error) {
    console.error("Admin verification failed:", error.message);

    return res.status(401).json({
      success: false,
      message: "Unauthorized – authentication failed",
    });
  }
};