import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";
import { sendPasswordChangeMail } from "../utils/sendMail.js";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey"; // ← use real secret in .env!

/* =========================
   LOGIN ADMIN
========================= */
export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: admin._id }, JWT_SECRET, {
      expiresIn: "1d",
    });

    res.cookie("adminToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",     // false → http (dev), true → https (prod)
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 24 * 60 * 60 * 1000, // 1 day in milliseconds (matches token expiry)
    });

    return res.status(200).json({ message: "Login successful" });
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({ message: "Server error during login" });
  }
};

/* =========================
   GET ADMIN PROFILE
========================= */
export const getProfile = async (req, res) => {
  try {
    // req.admin should be set by auth middleware (verifyAdmin)
    if (!req.admin?.id) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const admin = await Admin.findById(req.admin.id).select("-password");

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    return res.status(200).json(admin);
  } catch (error) {
    console.error("Get Profile Error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

/* =========================
   UPDATE PROFILE
========================= */
export const updateProfile = async (req, res) => {
  try {
    if (!req.admin?.id) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const { name, phone } = req.body;

    const admin = await Admin.findByIdAndUpdate(
      req.admin.id,
      { name, phone },
      { new: true, runValidators: true }
    ).select("-password");

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    return res.status(200).json(admin);
  } catch (error) {
    console.error("Update Profile Error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

/* =========================
   CHANGE PASSWORD
========================= */
export const changePassword = async (req, res) => {
  try {
    if (!req.admin?.id) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: "New password is required and must be at least 6 characters" });
    }

    const hashed = await bcrypt.hash(newPassword, 10);

    await Admin.findByIdAndUpdate(req.admin.id, {
      password: hashed,
    });

    // Send email notification (make sure this function exists & works)
    await sendPasswordChangeMail();   // ← you may want to pass admin email or name here

    return res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Change Password Error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};