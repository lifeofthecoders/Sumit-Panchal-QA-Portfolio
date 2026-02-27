import mongoose from "mongoose";

const adminSchema = new mongoose.Schema(
  {
    name: { type: String, default: "Admin" },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: String,
    isVerified: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model("Admin", adminSchema);