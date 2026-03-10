import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";
import { sendPasswordChangeMail } from "../utils/sendMail.js";
import cloudinary from "../config/cloudinary.js"; // Import Cloudinary directly for manual upload fallback

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";
const JWT_EXPIRY = "7d";

/* =========================
   LOGIN ADMIN
========================= */
export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email?.trim() || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const admin = await Admin.findOne({ email: email.trim() }).select("+password");

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    /* 🔐 Account Lock Protection */
    if (admin.isLocked && admin.isLocked()) {
      return res.status(423).json({
        success: false,
        message:
          "Account locked due to multiple failed login attempts. Try again later.",
      });
    }

    const isMatch = await bcrypt.compare(password, admin.password);

    if (!isMatch) {
      if (admin.incrementLoginAttempts) {
        await admin.incrementLoginAttempts();
      }

      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    /* ✅ Reset login attempts on success */
    admin.loginAttempts = 0;
    admin.lockUntil = undefined;
    admin.lastLogin = new Date();
    await admin.save();

    /* 🔐 Include tokenVersion for invalidation */
    const token = jwt.sign(
      {
        id: admin._id,
        role: admin.role || "admin",
        tokenVersion: admin.tokenVersion || 0,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRY }
    );

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error during login",
    });
  }
};

/* =========================
   GET ADMIN PROFILE
========================= */
export const getProfile = async (req, res) => {
  try {
    if (!req.admin?.id) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
    }

    const admin = await Admin.findById(req.admin.id).select("-password");

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: admin,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/* =========================
   UPDATE PROFILE (PERMANENT FIX - Manual Cloudinary Upload)
========================= */
export const updateProfile = async (req, res) => {
  try {
    if (!req.admin?.id) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
    }

    const { name, phone, dob, emergencyName, emergencyPhone } = req.body;
    const updateData = {};

    if (name && name.trim().length >= 2) {
      updateData.name = name.trim();
    }

    if (phone?.trim()) {
      updateData.phone = phone.trim();
    }

    if (dob) {
      updateData.dob = new Date(dob);
    }

    if (emergencyName?.trim()) {
      updateData.emergencyName = emergencyName.trim();
    }

    if (emergencyPhone?.trim()) {
      updateData.emergencyPhone = emergencyPhone.trim();
    }

    // ────────────────────────────────────────────────
    // PROFILE PICTURE HANDLING – PERMANENT MANUAL UPLOAD
    // ────────────────────────────────────────────────
    if (req.file && req.file.buffer) {
      // Manual upload to Cloudinary (bypasses multer-storage issues)
      const uploadPromise = new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: "profiles", // Dedicated folder for profiles
            transformation: [
              { width: 400, height: 400, crop: "fill", gravity: "face" }, // Auto-crop to square
              { quality: "auto", fetch_format: "auto" } // Optimize format/quality
            ],
            public_id: `profile_${req.admin.id}_${Date.now()}`, // Unique ID
            overwrite: true
          },
          (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result.secure_url);
            }
          }
        );

        // Pipe the buffer to Cloudinary stream
        uploadStream.end(req.file.buffer);
      });

      try {
        const profilePicUrl = await uploadPromise;
        updateData.profilePic = profilePicUrl;
      } catch (uploadErr) {
        // Fallback: Save as local file
        const fs = await import("fs/promises");
        const path = await import("path");
        const filename = `profile_${req.admin.id}_${Date.now()}.jpg`;
        const filepath = path.default.join(process.cwd(), "uploads", filename);

        try {
          await fs.mkdir(path.default.dirname(filepath), { recursive: true });
          await fs.writeFile(filepath, req.file.buffer);
          updateData.profilePic = `/uploads/${filename}`;
        } catch (localErr) {
          // Ultimate fallback: skip pic update
        }
      }
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid fields or file provided for update",
      });
    }

    const updatedAdmin = await Admin.findByIdAndUpdate(
      req.admin.id,
      updateData,
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedAdmin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    // Log activity
    updatedAdmin.activity = updatedAdmin.activity || [];
    updatedAdmin.activity.push({
      action: "Profile updated",
      timestamp: new Date(),
    });
    await updatedAdmin.save();

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: updatedAdmin,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error during profile update",
      error: error.message,
    });
  }
};

/* =========================
   CHANGE PASSWORD
========================= */
export const changePassword = async (req, res) => {
  try {
    if (!req.admin?.id) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
    }

    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Old password and new password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters",
      });
    }

    const admin = await Admin.findById(req.admin.id).select("+password");

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    const isMatch = await bcrypt.compare(oldPassword, admin.password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Old password is incorrect",
      });
    }

    const isSame = await bcrypt.compare(newPassword, admin.password);
    if (isSame) {
      return res.status(400).json({
        success: false,
        message: "New password must be different from old password",
      });
    }

    /* Assign plain password (pre-save hook hashes it) */
    admin.password = newPassword;
    await admin.save();

    // Log activity
    admin.activity = admin.activity || [];
    admin.activity.push({
      action: "Password changed",
      timestamp: new Date(),
    });
    await admin.save();

    try {
      await sendPasswordChangeMail();
    } catch (mailErr) {
      // Silent fail on email (non-critical)
    }

    return res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};