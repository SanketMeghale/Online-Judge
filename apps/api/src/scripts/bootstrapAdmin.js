import mongoose from "mongoose";
import dotenv from "dotenv";
import { connectDatabase } from "../lib/db.js";
import { User } from "../models/User.js";
import { hashPassword } from "../lib/jwt.js";

dotenv.config();

async function bootstrapSuperAdmin() {
  const email = process.argv[2] || process.env.ADMIN_EMAIL || "admin@judgo.dev";
  const password = process.argv[3] || process.env.ADMIN_PASSWORD || "Admin@123456";
  const name = process.argv[4] || "Judgo Super Administrator";

  console.log(`[Bootstrap] Initializing database connection...`);
  await connectDatabase();

  if (mongoose.connection.readyState !== 1) {
    console.error("[Bootstrap] Error: MongoDB is not connected. Please check MONGODB_URI.");
    process.exit(1);
  }

  const cleanEmail = email.trim().toLowerCase();
  console.log(`[Bootstrap] Bootstrapping Super Admin for email: ${cleanEmail}`);

  let existing = await User.findOne({ email: cleanEmail });

  if (existing) {
    existing.role = "super_admin";
    existing.status = "active";
    existing.isDeleted = false;
    if (password && !existing.firebaseUid) {
      existing.passwordHash = await hashPassword(password);
    }
    await existing.save();
    console.log(`[Bootstrap] SUCCESS: User '${cleanEmail}' has been promoted to SUPER_ADMIN.`);
  } else {
    const baseUsername = cleanEmail.split("@")[0].replace(/[^a-zA-Z0-9_]/g, "") || "admin";
    const passwordHash = await hashPassword(password);

    const created = await User.create({
      id: `u-superadmin-${Date.now()}`,
      name,
      displayName: name,
      username: baseUsername,
      email: cleanEmail,
      passwordHash,
      role: "super_admin",
      status: "active",
      badges: ["Super Administrator", "Platform Founder"],
      ranking: 1,
      xp: 10000,
      streak: 30,
      bestStreak: 100
    });
    console.log(`[Bootstrap] SUCCESS: Created new SUPER_ADMIN user '${created.email}' (ID: ${created.id}).`);
  }

  process.exit(0);
}

bootstrapSuperAdmin().catch((err) => {
  console.error("[Bootstrap] Fatal error:", err);
  process.exit(1);
});
