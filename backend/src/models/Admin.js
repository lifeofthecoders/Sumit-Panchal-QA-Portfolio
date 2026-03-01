import mongoose from "mongoose";

const adminSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Admin name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters long"],
      maxlength: [100, "Name cannot exceed 100 characters"],
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please enter a valid email address",
      ],
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters long"],
      // Note: We never select password by default - see toJSON below
    },

    phone: {
      type: String,
      trim: true,
      // Optional: you can add regex for Indian phone numbers if needed
      // match: [/^(\+91[\-\s]?)?[0]?(91)?[789]\d{9}$/, "Invalid phone number"],
    },

    isVerified: {
      type: Boolean,
      default: true, // You can change to false if you want email verification later
    },

    // Optional but recommended for future-proofing
    role: {
      type: String,
      enum: ["admin", "superadmin"],
      default: "admin",
    },

    // You can add reset token fields later if needed
    // resetPasswordToken: String,
    // resetPasswordExpires: Date,
  },
  {
    timestamps: true,
  }
);

// Automatically remove password from JSON responses
adminSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

// Optional: virtual for full name or other computed fields (if needed later)
// adminSchema.virtual('fullName').get(function () { ... });

export default mongoose.model("Admin", adminSchema);