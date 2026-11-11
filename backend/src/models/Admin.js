
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const PASSWORD_HISTORY_LIMIT = 5;
const BCRYPT_SALT_ROUNDS = 12;

const adminSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      select: false,
    },

    // Previous five password hashes (never plaintext).
    passwordHistory: {
      type: [String],
      default: [],
      select: false,
    },

    phone: {
      type: String,
      trim: true,
    },

    dob: {
      type: Date,
    },

    emergencyName: {
      type: String,
      trim: true,
    },

    emergencyPhone: {
      type: String,
      trim: true,
    },

    profilePic: {
      type: String,
      default: "/image/profile.jpg",
    },

    role: {
      type: String,
      enum: ["admin", "superadmin"],
      default: "admin",
    },

    /* Authentication Security */

    passwordChangedAt: Date,

    tokenVersion: {
      type: Number,
      default: 0,
    },

    passwordResetToken: String,
    passwordResetExpires: Date,

    loginAttempts: {
      type: Number,
      default: 0,
    },

    lockUntil: Date,

    sessions: [
      {
        sessionId: String,
        refreshTokenHash: String,
        ip: String,
        userAgent: String,
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    /* Activity Log */

    activity: [
      {
        action: String,
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

/* =========================================
   PASSWORD HASHING AND HISTORY
========================================= */

adminSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }

  // A new administrator has no previous password.
  if (!this.isNew) {
    // Password history must be loaded before changing a password.
    if (!this.isSelected("passwordHistory")) {
      throw new Error(
        "Password history must be selected before changing the password."
      );
    }

    // Preserve the previous current password hash.
    const previousHistory = this.passwordHistory || [];

    this.passwordHistory = [
      this.password,
      ...previousHistory,
    ].slice(0, PASSWORD_HISTORY_LIMIT);

    // Invalidate existing JWTs and sessions.
    this.tokenVersion = (this.tokenVersion || 0) + 1;

    this.passwordChangedAt = new Date(Date.now() - 1000);

    this.sessions = [];

    this.loginAttempts = 0;
    this.lockUntil = undefined;
  }

  const salt = await bcrypt.genSalt(BCRYPT_SALT_ROUNDS);

  this.password = await bcrypt.hash(this.password, salt);
});

/* =========================================
   PASSWORD COMPARISON
========================================= */

adminSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

/* =========================================
   PASSWORD HISTORY VALIDATION
========================================= */

adminSchema.methods.isPasswordRecentlyUsed = async function (candidate) {
  if (!this.isSelected("password") || !this.isSelected("passwordHistory")) {
    throw new Error(
      "Current password and password history must be selected for validation."
    );
  }

  // Check current password first.
  const currentPasswordMatches = await bcrypt.compare(
    candidate,
    this.password
  );

  if (currentPasswordMatches) {
    return true;
  }

  // Check the five previous password hashes.
  const history = this.passwordHistory || [];

  for (const oldPasswordHash of history) {
    const matches = await bcrypt.compare(candidate, oldPasswordHash);

    if (matches) {
      return true;
    }
  }

  return false;
};

/* =========================================
   ACCOUNT LOCK CHECK
========================================= */

adminSchema.methods.isLocked = function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
};

/* =========================================
   LOGIN ATTEMPT TRACKING
========================================= */

adminSchema.methods.incrementLoginAttempts = async function () {
  const MAX_ATTEMPTS = 5;
  const LOCK_DURATION = 30 * 60 * 1000;

  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $set: {
        loginAttempts: 1,
      },
      $unset: {
        lockUntil: 1,
      },
    });
  }

  const updates = {
    $inc: {
      loginAttempts: 1,
    },
  };

  if (this.loginAttempts + 1 >= MAX_ATTEMPTS) {
    updates.$set = {
      lockUntil: Date.now() + LOCK_DURATION,
    };
  }

  return this.updateOne(updates);
};

/* =========================================
   PASSWORD RESET TOKEN GENERATION
========================================= */

adminSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  // Store only the SHA-256 hash in MongoDB.
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // Reset link expires after 10 minutes.
  this.passwordResetExpires = new Date(
    Date.now() + 10 * 60 * 1000
  );

  // Return the original token for the email link.
  return resetToken;
};

/* =========================================
   MODEL EXPORT
========================================= */

const Admin = mongoose.model("Admin", adminSchema);

export default Admin;
