import mongoose from "mongoose";
import { connectDatabase, isDatabaseConnected } from "./db.js";
import { hashPassword, hashPasswordSync, verifyPassword } from "./jwt.js";
import { User } from "../models/User.js";


const memoryUsers = [];

export async function findUserByEmail(email) {
  if (!email) return null;
  await connectDatabase();
  const cleanEmail = email.trim().toLowerCase();

  if (isDatabaseConnected()) {
    try {
      const doc = await User.findOne({ email: cleanEmail }).lean();
      return doc ? sanitizeUser(doc) : null;
    } catch (e) {
      console.error("[UserStore] findUserByEmail DB error:", e);
    }
  }

  const u = memoryUsers.find((item) => item.email.toLowerCase() === cleanEmail);
  return u ? sanitizeUser(u) : null;
}

export async function findUserByUsername(username) {
  if (!username) return null;
  await connectDatabase();
  const cleanUser = username.trim().toLowerCase();

  if (isDatabaseConnected()) {
    try {
      const doc = await User.findOne({ username: { $regex: new RegExp(`^${cleanUser.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}$`, "i") } }).lean();
      return doc ? sanitizeUser(doc) : null;
    } catch (e) {
      console.error("[UserStore] findUserByUsername DB error:", e);
    }
  }

  const u = memoryUsers.find((item) => item.username.toLowerCase() === cleanUser);
  return u ? sanitizeUser(u) : null;
}

export async function findUserById(id) {
  if (!id) return null;
  await connectDatabase();

  if (isDatabaseConnected()) {
    try {
      const isObjId = mongoose.Types.ObjectId.isValid(String(id));
      const query = isObjId ? { $or: [{ id: String(id) }, { _id: id }] } : { id: String(id) };
      const doc = await User.findOne(query).lean();
      if (doc) return sanitizeUser(doc);
      // Fallback query by ObjectId
      const docByObjId = await User.findById(id).lean().catch(() => null);
      if (docByObjId) return sanitizeUser(docByObjId);
    } catch (e) {
      console.error("[UserStore] findUserById error:", e);
    }
  }

  const u = memoryUsers.find((item) => String(item.id) === String(id) || String(item._id) === String(id));
  return u ? sanitizeUser(u) : null;
}

export async function createUser({ name, username, email, password }) {
  await connectDatabase();
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
    stats: {
      totalSubmissions: 0,
      acceptedSubmissions: 0,
      waCount: 0,
      reCount: 0,
      tleCount: 0
    },
    createdAt: new Date()
  };

  if (isDatabaseConnected()) {
    try {
      const doc = await User.create(userObj);
      console.log(`[UserStore] User '${email || username}' successfully created in MongoDB Atlas.`);
      return sanitizeUser(doc.toObject());
    } catch (e) {
      console.error("[UserStore] createUser DB error:", e);
    }
  }

  memoryUsers.push(userObj);
  return sanitizeUser(userObj);
}

export async function validateUserCredentials(identifier, password) {
  if (!identifier || !password) return null;
  await connectDatabase();
  const clean = identifier.trim().toLowerCase();

  let rawUser = null;

  if (isDatabaseConnected()) {
    try {
      rawUser = await User.findOne({
        $or: [
          { email: clean },
          { username: { $regex: new RegExp(`^${clean.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}$`, "i") } }
        ]
      }).lean();
    } catch (e) {
      console.error("[UserStore] DB lookup error:", e);
    }
  }

  if (!rawUser) {
    rawUser = memoryUsers.find(
      (u) => u.email.toLowerCase() === clean || u.username.toLowerCase() === clean
    );
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
  const { passwordHash, _id, __v, ...safeUser } = user;
  const primaryId = String(user.id || _id || "");
  const mongoId = _id ? String(_id) : primaryId;
  return {
    ...safeUser,
    id: primaryId,
    _id: mongoId,
    solved: safeUser.solvedProblemIds?.length || 0,
    stats: safeUser.stats || {
      totalSubmissions: 0,
      acceptedSubmissions: 0,
      waCount: 0,
      reCount: 0,
      tleCount: 0
    }
  };
}

