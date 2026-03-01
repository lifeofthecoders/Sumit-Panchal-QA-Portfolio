import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

// Security check: ensure strong secret in production
if (!JWT_SECRET || JWT_SECRET.length < 32) {
  if (process.env.NODE_ENV === "production") {
    console.error(
      "CRITICAL: JWT_SECRET is missing or too weak. Set a strong secret in environment variables."
    );
    process.exit(1);
  } else {
    console.warn(
      "Warning: Using weak or missing JWT_SECRET. Set a strong secret in production."
    );
  }
}

/**
 * Middleware: Verify admin JWT token from Authorization header
 * - Expects: Authorization: Bearer <token>
 * - Verifies signature & expiry
 * - Attaches decoded admin info to req.admin
 */
export const verifyAdmin = (req, res, next) => {
  try {
    // 1️⃣ Extract token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authentication required – no token provided",
      });
    }

    const token = authHeader.split(" ")[1];

    // 2️⃣ Verify JWT
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

      if (jwtError.name === "JsonWebTokenError") {
        return res.status(401).json({
          success: false,
          message: "Invalid authentication token",
        });
      }

      throw jwtError;
    }

    // 3️⃣ Attach decoded admin info to request
    req.admin = {
      id: decoded.id,
      role: decoded.role,
    };

    // Optional logging in development
    if (process.env.NODE_ENV === "development") {
      console.log(`Admin verified: ID ${req.admin.id}`);
    }

    // 4️⃣ Continue
    next();

  } catch (error) {
    console.error("Admin verification failed:", {
      message: error.message,
      stack: error.stack?.substring(0, 200),
    });

    return res.status(401).json({
      success: false,
      message: "Unauthorized – authentication failed",
    });
  }
};