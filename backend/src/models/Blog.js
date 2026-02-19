import mongoose from "mongoose";

const BlogSchema = new mongoose.Schema(
  {
    image: { type: String, required: true },
    type: { type: String, required: true },
    author: { type: String, required: true },
    profession: { type: String, required: true },
    date: { type: String, required: true }, // stored as YYYY-MM-DD from admin form
    title: { type: String, required: true },
    description: { type: String, required: true },
  },
  { timestamps: true }
);

// Ensure consistent default sorting if needed
// (We'll sort in queries instead)

export default mongoose.model("Blog", BlogSchema);
