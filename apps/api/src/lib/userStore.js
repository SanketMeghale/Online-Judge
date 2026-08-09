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
      const doc = await User.findOne({
        username: { $regex: new RegExp(`^${cleanUser.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&")}$`, "i") }
      }).lean();
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

export async function isUsernameAvailable(username, currentUserId = null) {
  if (!username) return false;
  await connectDatabase();
  const clean = username.trim().toLowerCase();

  if (isDatabaseConnected()) {
    try {
      const query = {
        username: { $regex: new RegExp(`^${clean.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&")}$`, "i") }
      };
      if (currentUserId) {
        query.$and = [
          { id: { $ne: String(currentUserId) } }
        ];
      }
      const existing = await User.findOne(query).lean();
      return !existing;
    } catch (e) {
      console.error("[UserStore] isUsernameAvailable DB error:", e);
    }
  }

  const found = memoryUsers.find(
    (u) => u.username.toLowerCase() === clean && String(u.id) !== String(currentUserId) && String(u._id) !== String(currentUserId)
  );
  return !found;
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
    bio: "",
    language: "en-US",
    timezone: "UTC-5 (Eastern Time)",
    preferences: {
      theme: "dark",
      accentColor: "indigo",
      density: "comfortable",
      fontSize: 14,
      tabSize: 4,
      wordWrap: true,
      lineNumbers: true,
      autoSave: true,
      editorTheme: "judgo-dark",
      contestReminders: true,
      submissionResults: true,
      achievementAlerts: true,
      dailyStreakReminders: true,
      aiCoachNotifications: true,
      publicProfile: true,
      showSolvedProblems: true,
      showActivity: true,
      showContestRanking: true
    },
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

export async function updateUserProfile(userId, updateData) {
  if (!userId) return null;
  await connectDatabase();

  const allowedFields = {};
  if (typeof updateData.name === "string" && updateData.name.trim()) {
    allowedFields.name = updateData.name.trim();
  }
  if (typeof updateData.displayName === "string" && updateData.displayName.trim()) {
    allowedFields.name = updateData.displayName.trim();
  }
  if (typeof updateData.username === "string" && updateData.username.trim()) {
    allowedFields.username = updateData.username.trim();
  }
  if (typeof updateData.bio === "string") {
    allowedFields.bio = updateData.bio.slice(0, 300);
  }
  if (typeof updateData.language === "string") {
    allowedFields.language = updateData.language;
  }
  if (typeof updateData.timezone === "string") {
    allowedFields.timezone = updateData.timezone;
  }
  if (updateData.preferences && typeof updateData.preferences === "object") {
    allowedFields.preferences = updateData.preferences;
  }

  if (isDatabaseConnected()) {
    try {
      const isObjId = mongoose.Types.ObjectId.isValid(String(userId));
      const query = isObjId ? { $or: [{ id: String(userId) }, { _id: userId }] } : { id: String(userId) };

      const doc = await User.findOneAndUpdate(
        query,
        { $set: allowedFields },
        { new: true, runValidators: true }
      ).lean();

      if (doc) return sanitizeUser(doc);
    } catch (e) {
      console.error("[UserStore] updateUserProfile DB error:", e);
    }
  }

  // Fallback in-memory
  const idx = memoryUsers.findIndex(
    (u) => String(u.id) === String(userId) || String(u._id) === String(userId)
  );
  if (idx !== -1) {
    memoryUsers[idx] = {
      ...memoryUsers[idx],
      ...allowedFields,
      preferences: {
        ...(memoryUsers[idx].preferences || {}),
        ...(allowedFields.preferences || {})
      }
    };
    return sanitizeUser(memoryUsers[idx]);
  }

  return null;
}

export async function updateUserPassword(userId, newPassword) {
  if (!userId || !newPassword) return false;
  await connectDatabase();
  const hashedPassword = await hashPassword(newPassword);

  if (isDatabaseConnected()) {
    try {
      const isObjId = mongoose.Types.ObjectId.isValid(String(userId));
      const query = isObjId ? { $or: [{ id: String(userId) }, { _id: userId }] } : { id: String(userId) };
      const res = await User.updateOne(query, { $set: { passwordHash: hashedPassword } });
      return res.modifiedCount > 0;
    } catch (e) {
      console.error("[UserStore] updateUserPassword DB error:", e);
    }
  }

  const u = memoryUsers.find(
    (item) => String(item.id) === String(userId) || String(item._id) === String(userId)
  );
  if (u) {
    u.passwordHash = hashedPassword;
    return true;
  }

  return false;
}

export async function deleteUser(userId) {
  if (!userId) return false;
  await connectDatabase();

  if (isDatabaseConnected()) {
    try {
      const isObjId = mongoose.Types.ObjectId.isValid(String(userId));
      const query = isObjId ? { $or: [{ id: String(userId) }, { _id: userId }] } : { id: String(userId) };
      const res = await User.deleteOne(query);
      return res.deletedCount > 0;
    } catch (e) {
      console.error("[UserStore] deleteUser DB error:", e);
    }
  }

  const idx = memoryUsers.findIndex(
    (u) => String(u.id) === String(userId) || String(u._id) === String(userId)
  );
  if (idx !== -1) {
    memoryUsers.splice(idx, 1);
    return true;
  }

  return false;
}

/**
 * Record user submission verdict and update solved/attempted problem IDs and stats permanently
 */
export async function recordUserSubmission(userId, problemId, verdict, points = 10) {
  if (!userId || !problemId) return null;
  await connectDatabase();

  const isAc = verdict === "AC" || verdict === "OK" || verdict === "Accepted";
  const xpEarned = isAc ? (Number(points) || 10) * 10 : 0;

  const mongoUpdate = {
    $addToSet: { attemptedProblemIds: String(problemId) },
    $inc: { "stats.totalSubmissions": 1 }
  };

  if (isAc) {
    mongoUpdate.$addToSet.solvedProblemIds = String(problemId);
    mongoUpdate.$inc["stats.acceptedSubmissions"] = 1;
    mongoUpdate.$inc.xp = xpEarned;
  } else if (verdict === "WA") {
    mongoUpdate.$inc["stats.waCount"] = 1;
  } else if (verdict === "RE") {
    mongoUpdate.$inc["stats.reCount"] = 1;
  } else if (verdict === "TLE") {
    mongoUpdate.$inc["stats.tleCount"] = 1;
  } else if (verdict === "CE") {
    mongoUpdate.$inc["stats.ceCount"] = 1;
  }

  if (isDatabaseConnected()) {
    try {
      const isObjId = mongoose.Types.ObjectId.isValid(String(userId));
      const query = isObjId ? { $or: [{ id: String(userId) }, { _id: userId }] } : { id: String(userId) };

      const doc = await User.findOneAndUpdate(query, mongoUpdate, { new: true }).lean();
      if (doc) {
        console.log(`[UserStore] Updated user '${userId}' submission stats: AC=${isAc}, solvedCount=${doc.solvedProblemIds?.length || 0}`);
        return sanitizeUser(doc);
      }
    } catch (e) {
      console.error("[UserStore] recordUserSubmission DB error:", e);
    }
  }

  // Fallback in-memory
  const idx = memoryUsers.findIndex(
    (u) => String(u.id) === String(userId) || String(u._id) === String(userId)
  );

  if (idx !== -1) {
    const user = memoryUsers[idx];
    const attempted = new Set(user.attemptedProblemIds || []);
    attempted.add(String(problemId));
    user.attemptedProblemIds = Array.from(attempted);

    user.stats = user.stats || { totalSubmissions: 0, acceptedSubmissions: 0, waCount: 0, reCount: 0, tleCount: 0, ceCount: 0 };
    user.stats.totalSubmissions = (user.stats.totalSubmissions || 0) + 1;

    if (isAc) {
      const solved = new Set(user.solvedProblemIds || []);
      solved.add(String(problemId));
      user.solvedProblemIds = Array.from(solved);
      user.stats.acceptedSubmissions = (user.stats.acceptedSubmissions || 0) + 1;
      user.xp = (user.xp || 0) + xpEarned;
    } else if (verdict === "WA") {
      user.stats.waCount = (user.stats.waCount || 0) + 1;
    } else if (verdict === "RE") {
      user.stats.reCount = (user.stats.reCount || 0) + 1;
    } else if (verdict === "TLE") {
      user.stats.tleCount = (user.stats.tleCount || 0) + 1;
    }

    return sanitizeUser(user);
  }

  return null;
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
          { username: { $regex: new RegExp(`^${clean.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&")}$`, "i") } }
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

export async function verifyUserRawPassword(userId, currentPassword) {
  if (!userId || !currentPassword) return false;
  await connectDatabase();

  let rawUser = null;
  if (isDatabaseConnected()) {
    try {
      const isObjId = mongoose.Types.ObjectId.isValid(String(userId));
      const query = isObjId ? { $or: [{ id: String(userId) }, { _id: userId }] } : { id: String(userId) };
      rawUser = await User.findOne(query).lean();
    } catch (e) {
      console.error("[UserStore] verifyUserRawPassword DB error:", e);
    }
  }

  if (!rawUser) {
    rawUser = memoryUsers.find(
      (u) => String(u.id) === String(userId) || String(u._id) === String(userId)
    );
  }

  if (!rawUser || !rawUser.passwordHash) return false;
  return await verifyPassword(currentPassword, rawUser.passwordHash);
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
    bio: safeUser.bio || "",
    language: safeUser.language || "en-US",
    timezone: safeUser.timezone || "UTC-5 (Eastern Time)",
    preferences: safeUser.preferences || {
      theme: "dark",
      accentColor: "indigo",
      density: "comfortable",
      fontSize: 14,
      tabSize: 4,
      wordWrap: true,
      lineNumbers: true,
      autoSave: true,
      editorTheme: "judgo-dark",
      contestReminders: true,
      submissionResults: true,
      achievementAlerts: true,
      dailyStreakReminders: true,
      aiCoachNotifications: true,
      publicProfile: true,
      showSolvedProblems: true,
      showActivity: true,
      showContestRanking: true
    },
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
