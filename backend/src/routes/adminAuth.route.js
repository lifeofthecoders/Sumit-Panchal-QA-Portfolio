import express from "express";
import {
  loginAdmin,
  getProfile,
  updateProfile,
  changePassword,
} from "../controllers/adminAuth.controller.js";
import { verifyAdmin } from "../middlewares/adminAuth.js";

const router = express.Router();

// ────────────────────────────────────────────────
// Public Routes (No authentication required)
// ────────────────────────────────────────────────

/**
 * @route   POST /api/admin/login
 * @desc    Authenticate admin user and set adminToken cookie
 * @access  Public
 */
router.post("/login", loginAdmin);

// ────────────────────────────────────────────────
// Protected Routes (Require valid adminToken cookie)
// ────────────────────────────────────────────────

/**
 * @route   GET /api/admin/profile
 * @desc    Get the current authenticated admin's profile (without password)
 * @access  Private (Admin)
 */
router.get("/profile", verifyAdmin, getProfile);

/**
 * @route   PUT /api/admin/profile
 * @desc    Update admin profile fields (name, phone, etc.)
 * @access  Private (Admin)
 */
router.put("/profile", verifyAdmin, updateProfile);

/**
 * @route   PUT /api/admin/change-password
 * @desc    Change the authenticated admin's password
 * @access  Private (Admin)
 */
router.put("/change-password", verifyAdmin, changePassword);

/**
 * @route   POST /api/admin/logout
 * @desc    Logout admin by clearing authentication cookie
 * @access  Private (Admin)
 */
router.post("/logout", verifyAdmin, (req, res) => {
  // Clear the adminToken cookie
  res.clearCookie("adminToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    path: "/",
  });

  return res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
});

export default router;