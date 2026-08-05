import { isDatabaseConnected } from "./db.js";
import { hashPassword, verifyPassword } from "./jwt.js";
import { User } from "../models/User.js";
import mongoose from "mongoose";

const memoryUsers = [
  {
    id: "u-demo-1",
    _id: "65b9e2f81234567890abcdef",
    name: "Nadia Rao",
    username: "nadia.codes",
    email: "nadia@example.com",
    passwordHash: "$2a$10$e8w.x.N07H39.o0s7Z6Eue6vKjW1pG/4vX50Y.kQ1H0J5kZ7b8hSm", // bcrypt for 'password123'
    ranking: 87,
    xp: 8420,
    streak: 7,
    badges: ["7 Day Streak", "Graph Sprinter", "Contest Finisher"],
    solvedProblemIds: ["two-sum"],
    attemptedProblemIds: ["cache-stampede", "binary-lift"],
    bookmarkedProblemIds: ["two-sum"],
    createdAt: new Date("2026-01-15T00:00:00.000Z")
  }
];

export async function findUserByEmail(email) {
  if (!email) return null;
  const cleanEmail = email.trim().toLowerCase();

  if (isDatabaseConnected()) {
    try {
      const doc = await User.findOne({ email: cleanEmail }).lean();
      return doc ? sanitizeUser(doc) : null;
    } catch (err) {}
  }

  const u = memoryUsers.find((item) => item.email.toLowerCase() === cleanEmail);
  return u ? sanitizeUser(u) : null;
}

export async function findUserByUsername(username) {
  if (!username) return null;
  const cleanUser = username.trim().toLowerCase();

  if (isDatabaseConnected()) {
    try {
      const doc = await User.findOne({ username: cleanUser }).lean();
      return doc ? sanitizeUser(doc) : null;
    } catch (err) {}
  }

  const u = memoryUsers.find((item) => item.username.toLowerCase() === cleanUser);
  return u ? sanitizeUser(u) : null;
}

export async function findUserById(id) {
  if (!id) return null;
  const cleanId = String(id).trim();

  if (isDatabaseConnected()) {
    try {
      let doc = null;
      if (mongoose.Types.ObjectId.isValid(cleanId)) {
        doc = await User.findById(cleanId).lean();
      }
      if (!doc) {
        doc = await User.findOne({ id: cleanId }).lean();
      }
      if (doc) return sanitizeUser(doc);
    } catch (err) {}
  }

  const u = memoryUsers.find((item) => String(item.id) === cleanId || String(item._id) === cleanId);
  return u ? sanitizeUser(u) : null;
}

export async function createUser({ name, username, email, password }) {
  const hashedPassword = await hashPassword(password);
  const userObj = {
    id: `u-${Date.now()}`,
    name: name.trim(),
    username: username.trim(),
    email: email.trim().toLowerCase(),
    passwordHash: hashedPassword,
    ranking: 999,
    xp: 0,
    streak: 1,
    badges: ["New Challenger"],
    solvedProblemIds: [],
    attemptedProblemIds: [],
    bookmarkedProblemIds: [],
    createdAt: new Date()
  };

  if (isDatabaseConnected()) {
    try {
      const doc = await User.create(userObj);
      return sanitizeUser(doc.toObject());
    } catch (err) {}
  }

  memoryUsers.push(userObj);
  return sanitizeUser(userObj);
}

export async function validateUserCredentials(email, password) {
  if (!email || !password) return null;
  const cleanEmail = email.trim().toLowerCase();

  let rawUser = null;
  if (isDatabaseConnected()) {
    try {
      rawUser = await User.findOne({ email: cleanEmail }).lean();
    } catch (err) {}
  }

  if (!rawUser) {
    rawUser = memoryUsers.find((u) => u.email.toLowerCase() === cleanEmail);
  }

  if (!rawUser) return null;

  const isValid = await verifyPassword(password, rawUser.passwordHash);
  if (isValid) {
    return sanitizeUser(rawUser);
  }

  return null;
}

export function sanitizeUser(user) {
  if (!user) return null;
  const { passwordHash, password, _id, __v, ...safeUser } = user;
  const idStr = String(_id || user.id);
  return {
    ...safeUser,
    id: idStr,
    submissionId: idStr
  };
}
