import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";
import { sendPasswordChangeMail } from "../utils/sendMail.js";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

/* =========================
   LOGIN
========================= */
export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: admin._id }, JWT_SECRET, {
      expiresIn: "1d",
    });

    res.cookie("adminToken", token, {
      httpOnly: true,
      secure: false, // change to true in production (HTTPS)
      sameSite: "lax",
    });

    return res.json({ message: "Login successful" });
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

/* =========================
   GET PROFILE
========================= */
export const getProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin.id).select("-password");

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    return res.json(admin);
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
    const { name, phone } = req.body;

    const admin = await Admin.findByIdAndUpdate(
      req.admin.id,
      { name, phone },
      { new: true }
    ).select("-password");

    return res.json(admin);
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
    const { newPassword } = req.body;

    if (!newPassword) {
      return res.status(400).json({ message: "New password is required" });
    }

    const hashed = await bcrypt.hash(newPassword, 10);

    await Admin.findByIdAndUpdate(req.admin.id, {
      password: hashed,
    });

    // ✅ Correct function call
    await sendPasswordChangeMail();

    return res.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Change Password Error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};