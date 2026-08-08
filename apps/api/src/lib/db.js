import mongoose from "mongoose";
import { problems as seedProblems } from "../data/problems.js";
import { Problem } from "../models/Problem.js";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/online-judge";

let isConnected = false;

export async function connectDatabase() {
  if (isConnected) {
    return true;
  }

  const rawUri = (process.env.MONGODB_URI || "").trim();
  if (!rawUri || (!rawUri.startsWith("mongodb://") && !rawUri.startsWith("mongodb+srv://"))) {
    // Gracefully operate in in-memory dataset mode on serverless / Vercel without MongoDB
    return false;
  }

  try {
    await mongoose.connect(rawUri, {
      serverSelectionTimeoutMS: 3000
    });
    isConnected = true;
    console.log(`[MongoDB] Connected to database at ${rawUri.replace(/:([^:@]+)@/, ":****@")}`);

    // Seed problems if collection is empty
    const problemCount = await Problem.countDocuments();
    if (problemCount === 0) {
      console.log("[MongoDB] Seeding initial problems collection...");
      await Problem.insertMany(seedProblems);
      console.log("[MongoDB] Successfully seeded problems collection.");
    }

    return true;
  } catch (err) {
    console.warn(`[MongoDB] Connection notice: ${err.message}. Operating with in-memory dataset mode.`);
    return false;
  }
}

export function isDatabaseConnected() {
  return isConnected && mongoose.connection.readyState === 1;
}
