
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import Admin from "../models/Admin.js";
import { sendPasswordChangeMail, sendPasswordResetMail, } from "../utils/sendMail.js";
import crypto from "crypto";
import cloudinary from "../config/cloudinary.js";

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRY = "7d";

/* =========================
   LOGIN ADMIN — DATABASE ONLY
========================= */
export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // Fail closed if MongoDB is unavailable.
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        message: "Authentication service is temporarily unavailable",
      });
    }

    // Never issue tokens with a missing or weak secret.
    if (!JWT_SECRET || JWT_SECRET.length < 32) {
      console.error("JWT_SECRET is missing or too weak.");

      return res.status(503).json({
        success: false,
        message: "Authentication service is not configured correctly",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const admin = await Admin.findOne({
      email: normalizedEmail,
    }).select("+password +tokenVersion");

    // Only an existing MongoDB administrator can authenticate.
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    if (admin.isLocked()) {
      return res.status(423).json({
        success: false,
        message: "Account temporarily locked. Try again later.",
      });
    }

    const isMatch = await bcrypt.compare(password, admin.password);

    if (!isMatch) {
      await admin.incrementLoginAttempts();

      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Reset failed attempts after successful authentication.
    admin.loginAttempts = 0;
    admin.lockUntil = undefined;
    admin.lastLogin = new Date();

    await admin.save();

    const token = jwt.sign(
      {
        id: admin._id.toString(),
        role: admin.role,
        tokenVersion: admin.tokenVersion || 0,
      },
      JWT_SECRET,
      {
        expiresIn: JWT_EXPIRY,
        algorithm: "HS256",
      }
    );

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
    });
  } catch (error) {
    console.error("Admin login error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to process login",
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

    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        message: "Database unavailable",
      });
    }

    const admin = await Admin.findById(req.admin.id)
      .select("-password -sessions.refreshTokenHash");

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
    console.error("Get admin profile error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/* =========================
   UPDATE ADMIN PROFILE
========================= */
export const updateProfile = async (req, res) => {
  try {
    if (!req.admin?.id) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
    }

    const {
      name,
      phone,
      dob,
      emergencyName,
      emergencyPhone,
    } = req.body || {};

    const updateData = {};

    if (typeof name === "string" && name.trim().length >= 2) {
      updateData.name = name.trim();
    }

    if (typeof phone === "string" && phone.trim()) {
      updateData.phone = phone.trim();
    }

    if (dob) {
      const parsedDob = new Date(dob);

      if (Number.isNaN(parsedDob.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid date of birth",
        });
      }

      updateData.dob = parsedDob;
    }

    if (
      typeof emergencyName === "string" &&
      emergencyName.trim()
    ) {
      updateData.emergencyName = emergencyName.trim();
    }

    if (
      typeof emergencyPhone === "string" &&
      emergencyPhone.trim()
    ) {
      updateData.emergencyPhone = emergencyPhone.trim();
    }

    // Profile picture upload to Cloudinary.
    if (req.file?.buffer) {
      const uploadPromise = new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: "profiles",
            transformation: [
              {
                width: 400,
                height: 400,
                crop: "fill",
                gravity: "face",
              },
              {
                quality: "auto",
                fetch_format: "auto",
              },
            ],
            public_id: `profile_${req.admin.id}_${Date.now()}`,
            overwrite: true,
          },
          (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result.secure_url);
            }
          }
        );

        uploadStream.end(req.file.buffer);
      });

      try {
        const profilePicUrl = await uploadPromise;
        updateData.profilePic = profilePicUrl;
      } catch (uploadErr) {
        console.error(
          "Cloudinary profile upload failed:",
          uploadErr.message
        );

        // Preserve the existing local upload fallback.
        const fs = await import("fs/promises");
        const path = await import("path");

        const filename = `profile_${req.admin.id}_${Date.now()}.jpg`;
        const filepath = path.default.join(
          process.cwd(),
          "uploads",
          filename
        );

        try {
          await fs.mkdir(path.default.dirname(filepath), {
            recursive: true,
          });

          await fs.writeFile(filepath, req.file.buffer);
          updateData.profilePic = `/uploads/${filename}`;
        } catch (localErr) {
          console.error(
            "Local profile upload failed:",
            localErr.message
          );

          return res.status(500).json({
            success: false,
            message: "Profile picture upload failed",
          });
        }
      }
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid fields or file provided for update",
      });
    }

    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        message:
          "Database unavailable. Profile updates are disabled until the backend reconnects.",
      });
    }

    const updatedAdmin = await Admin.findByIdAndUpdate(
      req.admin.id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    ).select("-password -sessions.refreshTokenHash");

    if (!updatedAdmin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    // Record profile update activity.
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
    console.error("Update admin profile error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error during profile update",
    });
  }
};


/* =========================
   CHANGE ADMIN PASSWORD
========================= */
export const changePassword = async (req, res) => {
  try {
    if (!req.admin?.id) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
    }

    const { oldPassword, newPassword } = req.body || {};

    if (
      typeof oldPassword !== "string" ||
      typeof newPassword !== "string" ||
      !oldPassword ||
      !newPassword
    ) {
      return res.status(400).json({
        success: false,
        message: "Old password and new password are required",
      });
    }

    if (Buffer.byteLength(newPassword, "utf8") > 72) {
      return res.status(400).json({
        success: false,
        message: "Password cannot exceed 72 UTF-8 bytes",
      });
    }

    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        message: "Database unavailable. Password changes are disabled.",
      });
    }

    const admin = await Admin.findById(req.admin.id).select(
      "+password +passwordHistory +tokenVersion"
    );

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

    const recentlyUsed = await admin.isPasswordRecentlyUsed(newPassword);

    if (recentlyUsed) {
      return res.status(400).json({
        success: false,
        message: "You cannot reuse any of your last six passwords.",
      });
    }

    admin.password = newPassword;

    // Invalidate any outstanding reset link as well.
    admin.passwordResetToken = undefined;
    admin.passwordResetExpires = undefined;

    admin.activity = admin.activity || [];

    admin.activity.push({
      action: "Password changed",
      timestamp: new Date(),
    });

    // Model hook hashes the password, stores history,
    // increments tokenVersion and clears sessions.
    await admin.save();

    try {
      await sendPasswordChangeMail(admin.email);
    } catch (mailErr) {
      console.error(
        "Password change notification failed:",
        mailErr.message
      );
    }

    return res.status(200).json({
      success: true,
      message: "Password updated successfully. Please log in again.",
    });
  } catch (error) {
    console.error("Change admin password error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to change password",
    });
  }
};



/* =========================
   FORGOT ADMIN PASSWORD
========================= */
export const forgotPassword = async (req, res) => {
  let admin = null;
  let resetTokenHash = null;

  try {
    const { email } = req.body || {};

    // Validate email input.
    if (
      typeof email !== "string" ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
    ) {
      return res.status(400).json({
        success: false,
        code: "INVALID_EMAIL",
        message: "Please enter a valid email address.",
      });
    }

    // Ensure database is available.
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        code: "SERVICE_UNAVAILABLE",
        message: "Password recovery is temporarily unavailable.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Find registered administrator.
    admin = await Admin.findOne({
      email: normalizedEmail,
    });

    // Explicitly report an unregistered email.
    if (!admin) {
      return res.status(404).json({
        success: false,
        code: "ADMIN_EMAIL_NOT_FOUND",
        message:
          "This email address is not registered with the administrator account.",
      });
    }

    // Generate a secure password reset token.
    const resetToken = admin.createPasswordResetToken();

    resetTokenHash = admin.passwordResetToken;

    await admin.save();

    // Send reset email.
    try {
      await sendPasswordResetMail(admin.email, resetToken);
    } catch (mailError) {
      console.error(
        "Password reset email delivery failed:",
        mailError.message
      );

      // Remove the unusable reset token.
      try {
        await Admin.updateOne(
          {
            _id: admin._id,
            passwordResetToken: resetTokenHash,
          },
          {
            $unset: {
              passwordResetToken: 1,
              passwordResetExpires: 1,
            },
          }
        );
      } catch (cleanupError) {
        console.error(
          "Password reset token cleanup failed:",
          cleanupError.message
        );
      }

      return res.status(502).json({
        success: false,
        code: "RESET_EMAIL_DELIVERY_FAILED",
        message:
          "Unable to send the password reset email. Please try again later.",
      });
    }

    // Confirm success only after email delivery completes.
    return res.status(200).json({
      success: true,
      code: "RESET_EMAIL_SENT",
      emailSent: true,
      message: "Password reset email sent successfully.",
    });

  } catch (error) {
    console.error("Forgot password error:", error.message);

    return res.status(500).json({
      success: false,
      code: "FORGOT_PASSWORD_ERROR",
      message: "Unable to process password recovery. Please try again.",
    });
  }
};

/* =========================
   RESET ADMIN PASSWORD
========================= */
export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword, confirmPassword } = req.body || {};

    if (
      typeof token !== "string" ||
      !/^[a-f0-9]{64}$/i.test(token)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired password reset link.",
      });
    }

    if (
      typeof newPassword !== "string" ||
      typeof confirmPassword !== "string" ||
      !newPassword ||
      !confirmPassword
    ) {
      return res.status(400).json({
        success: false,
        message: "Both password fields are required.",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match.",
      });
    }

    if (Buffer.byteLength(newPassword, "utf8") > 72) {
      return res.status(400).json({
        success: false,
        message: "Password cannot exceed 72 UTF-8 bytes.",
      });
    }

    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        message: "Password recovery is temporarily unavailable.",
      });
    }

    // Hash the incoming token before looking it up.
    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const now = new Date();

    const admin = await Admin.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: now },
    }).select("+password +passwordHistory +tokenVersion");

    if (!admin) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired password reset link.",
      });
    }

    // Reject the current password and the five previous passwords.
    const recentlyUsed = await admin.isPasswordRecentlyUsed(newPassword);

    if (recentlyUsed) {
      return res.status(400).json({
        success: false,
        message: "You cannot reuse any of your last six passwords.",
      });
    }

    /*
      Atomically consume the reset token.

      Only one concurrent request can successfully match and
      remove this token. A second request cannot reuse it.
    */
    const claimedAdmin = await Admin.findOneAndUpdate(
      {
        _id: admin._id,
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: new Date() },
      },
      {
        $unset: {
          passwordResetToken: 1,
          passwordResetExpires: 1,
        },
      },
      {
        new: true,
      }
    ).select("+password +passwordHistory +tokenVersion");

    if (!claimedAdmin) {
      return res.status(400).json({
        success: false,
        message: "This password reset link has already been used or expired.",
      });
    }

    claimedAdmin.password = newPassword;

    claimedAdmin.activity = claimedAdmin.activity || [];

    claimedAdmin.activity.push({
      action: "Password reset through email",
      timestamp: new Date(),
    });

    /*
      The model save hook:
      - Hashes the new password.
      - Stores the previous password in history.
      - Retains only the five latest previous hashes.
      - Increments tokenVersion.
      - Invalidates existing sessions.
    */
    await claimedAdmin.save();

    try {
      await sendPasswordChangeMail(claimedAdmin.email);
    } catch (mailError) {
      console.error(
        "Password reset notification failed:",
        mailError.message
      );
    }

    return res.status(200).json({
      success: true,
      message:
        "Your password has been reset successfully. Please log in using your new password.",
    });
  } catch (error) {
    console.error("Reset password error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to reset password. Please try again.",
    });
  }
};
