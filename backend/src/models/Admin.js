import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";

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

    role: {
      type: String,
      enum: ["admin", "superadmin"],
      default: "admin",
    },

    /* 🔐 Banking-Level Security Fields */

    passwordChangedAt: Date,
    tokenVersion: { type: Number, default: 0 },

    passwordResetToken: String,
    passwordResetExpires: Date,

    loginAttempts: { type: Number, default: 0 },
    lockUntil: Date,

    sessions: [
      {
        sessionId: String,
        refreshTokenHash: String,
        ip: String,
        userAgent: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

/* HASH PASSWORD */
adminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);

  if (!this.isNew) {
    this.passwordChangedAt = Date.now() - 1000;
    this.tokenVersion += 1; // Invalidate all tokens
  }

  next();
});

/* COMPARE PASSWORD */
adminSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

/* LOCK CHECK */
adminSchema.methods.isLocked = function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
};

/* INCREMENT LOGIN ATTEMPTS */
adminSchema.methods.incrementLoginAttempts = async function () {
  const MAX_ATTEMPTS = 5;

  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $set: { loginAttempts: 1 },
      $unset: { lockUntil: 1 },
    });
  }

  const updates = { $inc: { loginAttempts: 1 } };

  if (this.loginAttempts + 1 >= MAX_ATTEMPTS) {
    updates.$set = {
      lockUntil: Date.now() + 30 * 60 * 1000,
    };
  }

  return this.updateOne(updates);
};

/* PASSWORD RESET TOKEN */
adminSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

export default mongoose.model("Admin", adminSchema);