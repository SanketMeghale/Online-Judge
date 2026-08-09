import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    role: { type: String, enum: ["user", "assistant", "system"], required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} }
  },
  { _id: false }
);

const aiConversationSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    userId: { type: String, required: true, index: true },
    title: { type: String, default: "AI Coding Mentorship" },
    messages: { type: [messageSchema], default: [] }
  },
  { timestamps: true, collection: "ai_conversations" }
);

export const AIConversation =
  mongoose.models.AIConversation || mongoose.model("AIConversation", aiConversationSchema);
