import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import bcrypt from "bcryptjs";

/* =========================
   Load Environment Variables
   ========================= */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, ".env") });

/* =========================
   Import Admin Model
   ========================= */
import Admin from "./src/models/Admin.js";

const MONGODB_URI = process.env.MONGODB_URI;

const seedAdmin = async () => {
  try {
    if (!MONGODB_URI) {
      throw new Error("MONGODB_URI missing in .env");
    }

    await mongoose.connect(MONGODB_URI);
    console.log("✅ MongoDB connected");

    const existingAdmin = await Admin.findOne({
      email: "sumitpanchal2552@gmail.com",
    });

    if (existingAdmin) {
      console.log("⚠️ Admin already exists. No need to seed again.");
      process.exit();
    }

    const hashedPassword = await bcrypt.hash("Sumit@2552", 10);

    await Admin.create({
      name: "Sumit Panchal",
      email: "sumitpanchal2552@gmail.com",
      password: hashedPassword,
      phone: "",
      isVerified: true,
    });

    console.log("🎉 Default Admin Created Successfully");
    process.exit();

  } catch (error) {
    console.error("❌ Seeding failed:", error.message);
    process.exit(1);
  }
};

seedAdmin();