import mongoose from "mongoose";
import { problems as seedProblems } from "../data/problems.js";
import { Problem } from "../models/Problem.js";

// Global cache across serverless warm starts on Vercel
let cached = global._mongooseCached;
if (!cached) {
  cached = global._mongooseCached = { conn: null, promise: null, seeded: false };
}

// Ensure mongoose does not hang operations when disconnected
mongoose.set("bufferCommands", false);

export async function connectDatabase() {
  const rawUri = (process.env.MONGODB_URI || "").trim();
  const isProduction = process.env.NODE_ENV === "production" || Boolean(process.env.VERCEL_ENV);

  // If no valid MongoDB URI, immediately operate in fast in-memory mode
  if (!rawUri || (!rawUri.startsWith("mongodb://") && !rawUri.startsWith("mongodb+srv://"))) {
    if (isProduction) throw new Error("A valid MONGODB_URI is required in production.");
    return false;
  }

  // Return existing active connection if ready
  if (mongoose.connection.readyState === 1) {
    return true;
  }

  if (!cached.promise) {
    const opts = {
      serverSelectionTimeoutMS: 2500,
      connectTimeoutMS: 2500,
      socketTimeoutMS: 8000,
      maxPoolSize: 5
    };

    cached.promise = mongoose
      .connect(rawUri, opts)
      .then((m) => {
        const masked = rawUri.replace(/:([^:@]+)@/, ":****@");
        console.log(`[MongoDB] Connected to database at ${masked}`);

        // Non-blocking background seeding
        if (!cached.seeded) {
          cached.seeded = true;
          Problem.estimatedDocumentCount()
            .then(async (count) => {
              if (count === 0) {
                console.log("[MongoDB] Seeding initial problems collection...");
                await Problem.insertMany(seedProblems);
                console.log("[MongoDB] Successfully seeded problems collection.");
              }
            })
            .catch(() => {});
        }

        return m;
      })
      .catch((err) => {
        cached.promise = null;
        if (isProduction) throw err;
        console.warn(`[MongoDB] Notice: ${err.message}. Operating with in-memory dataset mode.`);
        return null;
      });
  }

  try {
    cached.conn = await cached.promise;
    return mongoose.connection.readyState === 1;
  } catch (err) {
    cached.promise = null;
    if (isProduction) throw err;
    return false;
  }
}

export function isDatabaseConnected() {
  return mongoose.connection && mongoose.connection.readyState === 1;
}


