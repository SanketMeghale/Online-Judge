import "dotenv/config";
import mongoose from "mongoose";
import { User } from "../models/User.js";

const mongoUri = String(process.env.MONGODB_URI || "").trim();
if (!/^mongodb(?:\+srv)?:\/\//.test(mongoUri)) {
  throw new Error("MONGODB_URI is required to migrate the user search index.");
}

try {
  await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 10_000 });
  const listIndexes = async () => {
    try {
      return await User.collection.indexes();
    } catch (error) {
      // A new production database may not have a users collection yet.
      // Creating the index below also creates the collection, so treat a
      // missing namespace exactly like an empty index list.
      if (error?.code === 26 || error?.codeName === "NamespaceNotFound") {
        return [];
      }
      throw error;
    }
  };

  const indexes = await listIndexes();
  const textIndex = indexes.find((index) => Object.values(index.key || {}).includes("text"));

  if (textIndex && textIndex.language_override !== "searchLanguage") {
    console.log(`[Migration] Dropping incompatible user text index '${textIndex.name}'.`);
    await User.collection.dropIndex(textIndex.name);
  }

  const currentIndexes = await listIndexes();
  if (!currentIndexes.some((index) => Object.values(index.key || {}).includes("text"))) {
    await User.collection.createIndex(
      { name: "text", username: "text", email: "text" },
      {
        name: "name_text_username_text_email_text",
        default_language: "english",
        language_override: "searchLanguage"
      }
    );
    console.log("[Migration] Created the production-safe user search index.");
  } else {
    console.log("[Migration] User search index is already production-safe.");
  }
} finally {
  await mongoose.disconnect();
}
