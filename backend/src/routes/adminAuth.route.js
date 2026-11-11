
import express from "express";
import Admin from "../models/Admin.js";

import {
  loginAdmin,
  forgotPassword,
  resetPassword,
  getProfile,
  updateProfile,
  changePassword,
} from "../controllers/adminAuth.controller.js";

import { verifyAdmin } from "../middlewares/adminAuth.js";
import upload from "../middlewares/uploadBlogImage.js";

const router = express.Router();

/* =========================
   PUBLIC ROUTES
========================= */

/**
 * POST /api/admin/login
 * Authenticate an administrator using MongoDB credentials.
 */
router.post("/login", loginAdmin);

/**
 * POST /api/admin/forgot-password
 * Request a password reset email.
 */
router.post("/forgot-password", forgotPassword);

/**
 * POST /api/admin/reset-password
 * Reset administrator password using a valid reset token.
 */
router.post("/reset-password", resetPassword);

/* =========================
   PROTECTED ROUTES
========================= */

/**
 * GET /api/admin/profile
 * Get the authenticated administrator's profile.
 */
router.get("/profile", verifyAdmin, getProfile);

/**
 * PUT /api/admin/profile
 * Update administrator profile and profile picture.
 */
router.put(
  "/profile",
  verifyAdmin,
  upload.single("profilePic"),
  updateProfile
);

/**
 * PUT /api/admin/change-password
 * Change the authenticated administrator's password.
 */
router.put("/change-password", verifyAdmin, changePassword);

/**
 * POST /api/admin/logout
 * Revoke administrator authentication tokens.
 */
router.post("/logout", verifyAdmin, async (req, res) => {
  try {
    if (!req.admin?.id) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
    }

    // Incrementing tokenVersion invalidates existing JWTs.
    const result = await Admin.updateOne(
      { _id: req.admin.id },
      { $inc: { tokenVersion: 1 } }
    );

    if (result.matchedCount !== 1) {
      return res.status(401).json({
        success: false,
        message: "Administrator account not found",
      });
    }

    // Retain cookie cleanup for compatibility with older clients.
    res.clearCookie("adminToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite:
        process.env.NODE_ENV === "production" ? "none" : "lax",
      path: "/",
    });

    return res.status(200).json({
      success: true,
      message: "Logged out successfully. Please log in again.",
    });
  } catch (error) {
    console.error("Admin logout error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to complete logout",
    });
  }
});

export default router;
