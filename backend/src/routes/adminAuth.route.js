import express from "express";
import {
  loginAdmin,
  getProfile,
  updateProfile,
  changePassword,
} from "../controllers/adminAuth.controller.js";
import { verifyAdmin } from "../middlewares/adminAuth.js";

const router = express.Router();

router.post("/login", loginAdmin);
router.get("/profile", verifyAdmin, getProfile);
router.put("/profile", verifyAdmin, updateProfile);
router.put("/change-password", verifyAdmin, changePassword);

export default router;