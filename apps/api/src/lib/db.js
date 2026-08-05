import mongoose from "mongoose";
import { problems as seedProblems } from "../data/problems.js";
import { Problem } from "../models/Problem.js";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/online-judge";

let isConnected = false;

export async function connectDatabase() {
  if (isConnected) {
    return true;
  }

  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 3000
    });
    isConnected = true;
    console.log(`[MongoDB] Successfully connected to database at ${MONGODB_URI}`);

    // Seed problems if collection is empty
    const problemCount = await Problem.countDocuments();
    if (problemCount === 0) {
      console.log("[MongoDB] Seeding initial problems collection...");
      await Problem.insertMany(seedProblems);
      console.log("[MongoDB] Successfully seeded problems collection.");
    }

    return true;
  } catch (err) {
    console.warn(`[MongoDB] Connection notice: ${err.message}. Operating with hybrid fallback mode.`);
    return false;
  }
}

export function isDatabaseConnected() {
  return isConnected && mongoose.connection.readyState === 1;
}
