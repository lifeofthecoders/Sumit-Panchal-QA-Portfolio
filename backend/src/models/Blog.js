// src/models/Blog.js
import mongoose from "mongoose";

const blogSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  content: { type: String },
  description: { type: String, required: true },
  image: { type: String },
  public_id: { type: String },
  type: { type: String },
  author: { type: String },
  profession: { type: String },
  date: { type: Date },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Blog", blogSchema);