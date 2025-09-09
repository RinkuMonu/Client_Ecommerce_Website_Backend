import mongoose from "mongoose";

const faqSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
      trim: true,
    },
    answer: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      trim: true,
      default: "General", // optional category
    },
    isActive: {
      type: Boolean,
      default: true, // for enabling/disabling FAQ
    },
  },
  { timestamps: true }
);

export default mongoose.model("FAQ", faqSchema);
