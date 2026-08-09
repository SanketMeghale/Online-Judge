import mongoose from "mongoose";

const topicSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    icon: { type: String, default: "Layers" },
    category: { type: String, default: "Core Algorithms" },
    difficulty: { type: String, enum: ["Easy", "Medium", "Hard"], default: "Medium" },
    description: { type: String, default: "" },
    isActive: { type: Boolean, default: true, index: true },
    order: { type: Number, default: 0 }
  },
  { timestamps: true, collection: "topics" }
);

export const Topic = mongoose.models.Topic || mongoose.model("Topic", topicSchema);
