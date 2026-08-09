import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
  {
    adminId: { type: String, required: true, index: true },
    adminEmail: { type: String, required: true },
    action: { type: String, required: true, index: true },
    targetType: {
      type: String,
      enum: ["user", "problem", "topic", "contest", "test_case", "settings", "report", "auth"],
      required: true,
      index: true
    },
    targetId: { type: String, default: "" },
    description: { type: String, required: true },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
    ipAddress: { type: String, default: "" },
    createdAt: { type: Date, default: Date.now, index: true }
  },
  { collection: "audit_logs" }
);

export const AuditLog = mongoose.models.AuditLog || mongoose.model("AuditLog", auditLogSchema);
