import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

// ⚠️ Important: Never hardcode secret in production!
//     → Must be set in .env file (and never committed to git)

export const verifyAdmin = (req, res, next) => {
  try {
    const token = req.cookies?.adminToken;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No authentication token provided",
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (jwtError) {
      if (jwtError.name === "TokenExpiredError") {
        return res.status(401).json({
          success: false,
          message: "Authentication token has expired",
        });
      }
      if (jwtError.name === "JsonWebTokenError") {
        return res.status(401).json({
          success: false,
          message: "Invalid authentication token",
        });
      }
      throw jwtError; // other unexpected errors
    }

    // Attach minimal admin info to request
    req.admin = {
      id: decoded.id,
      // You can add more fields later if you include them in the token payload
      // e.g. role: decoded.role, email: decoded.email
    };

    next();
  } catch (error) {
    console.error("Admin verification failed:", {
      error: error.message,
      stack: error.stack?.substring(0, 200), // limit noise
    });

    return res.status(401).json({
      success: false,
      message: "Unauthorized – authentication failed",
    });
  }
};