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
// Public routes (no authentication required)
// ────────────────────────────────────────────────

/**
 * @route   POST /api/admin/login
 * @desc    Authenticate admin and get JWT token (sets cookie)
 * @access  Public
 */
router.post("/login", loginAdmin);

// ────────────────────────────────────────────────
// Protected routes (require valid adminToken cookie)
// ────────────────────────────────────────────────

/**
 * @route   GET /api/admin/profile
 * @desc    Get current authenticated admin profile
 * @access  Private (Admin)
 */
router.get("/profile", verifyAdmin, getProfile);

/**
 * @route   PUT /api/admin/profile
 * @desc    Update admin profile (name, phone, etc.)
 * @access  Private (Admin)
 */
router.put("/profile", verifyAdmin, updateProfile);

/**
 * @route   PUT /api/admin/change-password
 * @desc    Change admin password
 * @access  Private (Admin)
 */
router.put("/change-password", verifyAdmin, changePassword);

// Optional: you could add a logout route in the future
// router.post("/logout", verifyAdmin, logoutAdmin);  // would clear cookie

export default router;