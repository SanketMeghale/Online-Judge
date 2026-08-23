import mongoose from "mongoose";
import { connectDatabase, isDatabaseConnected } from "./db.js";
import { hashPassword, hashPasswordSync, verifyPassword } from "./jwt.js";
import { User } from "../models/User.js";
import { calculateUserStreak, formatDateKey } from "./streakEngine.js";

function createDemoUsers() {
  return [
  {
    id: "u-demouser",
    name: "Judgo Demo Coder",
    username: "demouser",
    email: "demo@judgo.dev",
    passwordHash: hashPasswordSync("demo-password-123"),
    bio: "Passionate about algorithms and system design.",
    role: "user",
    status: "active",
    suspendedReason: "",
    language: "en-US",
    timezone: "UTC-5 (Eastern Time)",
    ranking: 120,
    xp: 850,
    streak: 3,
    bestStreak: 7,
    badges: ["New Challenger"],
    solvedProblemIds: ["two-sum", "valid-parentheses"],
    attemptedProblemIds: ["two-sum", "valid-parentheses"],
    activeDates: [formatDateKey(new Date())],
    stats: {
      totalSubmissions: 10,
      acceptedSubmissions: 8,
      waCount: 2,
      reCount: 0,
      tleCount: 0
    },
    createdAt: new Date("2026-01-01")
  },
  {
    id: "u-coder-google",
    name: "Google Developer",
    username: "coder_google",
    email: "coder_google@judgo.dev",
    passwordHash: hashPasswordSync("demo-password-123"),
    bio: "Google Developer Account",
    ranking: 55,
    xp: 1400,
    streak: 4,
    bestStreak: 8,
    badges: ["New Challenger", "Google Club"],
    solvedProblemIds: ["two-sum"],
    attemptedProblemIds: ["two-sum"],
    activeDates: [formatDateKey(new Date())],
    stats: { totalSubmissions: 5, acceptedSubmissions: 4, waCount: 1, reCount: 0, tleCount: 0 },
    createdAt: new Date("2026-01-01")
  },
  {
    id: "u-coder-github",
    name: "GitHub Developer",
    username: "coder_github",
    email: "coder_github@judgo.dev",
    passwordHash: hashPasswordSync("demo-password-123"),
    bio: "GitHub Developer Account",
    ranking: 75,
    xp: 1100,
    streak: 3,
    bestStreak: 6,
    badges: ["New Challenger"],
    solvedProblemIds: ["two-sum"],
    attemptedProblemIds: ["two-sum"],
    activeDates: [formatDateKey(new Date())],
    stats: { totalSubmissions: 3, acceptedSubmissions: 3, waCount: 0, reCount: 0, tleCount: 0 },
    createdAt: new Date("2026-01-01")
  },
  {
    id: "u-coder-gitlab",
    name: "GitLab Developer",
    username: "coder_gitlab",
    email: "coder_gitlab@judgo.dev",
    passwordHash: hashPasswordSync("demo-password-123"),
    bio: "GitLab Developer Account",
    ranking: 85,
    xp: 950,
    streak: 2,
    bestStreak: 5,
    badges: ["New Challenger"],
    solvedProblemIds: ["two-sum"],
    attemptedProblemIds: ["two-sum"],
    activeDates: [formatDateKey(new Date())],
    stats: { totalSubmissions: 2, acceptedSubmissions: 2, waCount: 0, reCount: 0, tleCount: 0 },
    createdAt: new Date("2026-01-01")
  }
  ];
}

const isProduction = process.env.NODE_ENV === "production" || Boolean(process.env.VERCEL_ENV);
const memoryUsers = !isProduction && process.env.ENABLE_DEMO_USERS === "true" ? createDemoUsers() : [];

function persistenceUnavailable() {
  const error = new Error("User storage is temporarily unavailable.");
  error.statusCode = 503;
  return error;
}

export async function findUserByEmail(email) {
  if (!email) return null;
  await connectDatabase().catch(() => {});
  const cleanEmail = email.trim().toLowerCase();

  if (isDatabaseConnected()) {
    try {
      const doc = await User.findOne({ email: cleanEmail }).lean();
      if (doc) return sanitizeUser(doc);
    } catch (e) {
      console.error("[UserStore] findUserByEmail DB error:", e);
      if (isProduction) throw persistenceUnavailable();
    }
  }

  const u = memoryUsers.find((item) => item.email?.toLowerCase() === cleanEmail);
  return u ? sanitizeUser(u) : null;
}

export async function findUserByFirebaseUid(firebaseUid) {
  if (!firebaseUid) return null;
  await connectDatabase().catch(() => {});

  if (isDatabaseConnected()) {
    try {
      const doc = await User.findOne({ firebaseUid: String(firebaseUid) }).lean();
      if (doc) return sanitizeUser(doc);
    } catch (e) {
      console.error("[UserStore] findUserByFirebaseUid DB error:", e);
      if (isProduction) throw persistenceUnavailable();
    }
  }

  const u = memoryUsers.find((item) => item.firebaseUid === String(firebaseUid));
  return u ? sanitizeUser(u) : null;
}

function getEmailDerivedName(email) {
  return String(email || "")
    .split("@")[0]
    .replace(/[._-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export async function upsertFirebaseUser({ firebaseUid, email, displayName, photoURL, provider = "google.com" }) {
  if (!firebaseUid || !email) return null;
  await connectDatabase().catch(() => {});

  const cleanEmail = String(email).trim().toLowerCase();
  const cleanDisplayName = String(displayName || "").trim();
  const cleanPhotoURL = String(photoURL || "").trim();
  const cleanProvider = String(provider || "google.com").trim();
  const fallbackName = cleanDisplayName || getEmailDerivedName(cleanEmail) || "User";
  let rawUsername = cleanEmail.split("@")[0].replace(/[^a-zA-Z0-9_.-]/g, "").slice(0, 24);
  if (rawUsername.length < 3) {
    rawUsername = `user_${rawUsername || "coder"}_${Date.now().toString().slice(-4)}`;
  }
  const baseUsername = rawUsername;

  if (isDatabaseConnected()) {
    try {
      let existing = await User.findOne({
        $or: [{ firebaseUid: String(firebaseUid) }, { email: cleanEmail }]
      });

      if (existing) {
        existing.firebaseUid = String(firebaseUid);
        if (!existing.id) {
          existing.id = String(existing._id || `u-${Date.now()}`);
        }
        if (cleanDisplayName) {
          existing.displayName = cleanDisplayName;
        } else if (!existing.displayName) {
          existing.displayName = existing.name || fallbackName;
        }
        existing.name = existing.name || existing.displayName || fallbackName;
        existing.email = cleanEmail;
        if (cleanPhotoURL) {
          existing.photoURL = cleanPhotoURL;
        }
        existing.provider = cleanProvider;
        if (existing.isDeleted) {
          existing.isDeleted = false;
          existing.deletedAt = null;
        }
        existing.lastLoginAt = new Date();
        await existing.save();
        return sanitizeUser(existing.toObject());
      }

      let username = baseUsername;
      let counter = 1;
      while (!(await isUsernameAvailable(username))) {
        username = `${baseUsername}${counter++}`;
      }

      const created = await User.create({
        id: `u-${Date.now()}`,
        firebaseUid: String(firebaseUid),
        name: fallbackName,
        displayName: cleanDisplayName || fallbackName,
        username,
        email: cleanEmail,
        photoURL: cleanPhotoURL,
        provider: cleanProvider,
        passwordHash: "",
        role: "user",
        status: "active",
        lastLoginAt: new Date(),
        badges: ["New Challenger"],
        solvedProblemIds: [],
        attemptedProblemIds: [],
        stats: {
          totalSubmissions: 0,
          acceptedSubmissions: 0,
          waCount: 0,
          reCount: 0,
          tleCount: 0
        }
      });
      return sanitizeUser(created.toObject());
    } catch (e) {
      console.error("[UserStore] upsertFirebaseUser DB error:", e);
      if (isProduction) throw persistenceUnavailable();
    }
  }

  if (isProduction) throw persistenceUnavailable();

  let user = memoryUsers.find((item) => item.firebaseUid === String(firebaseUid) || item.email?.toLowerCase() === cleanEmail);
  if (!user) {
    let username = baseUsername;
    let counter = 1;
    while (memoryUsers.some((u) => u.username?.toLowerCase() === username.toLowerCase())) {
      username = `${baseUsername}${counter++}`;
    }
    user = {
      id: `u-${Date.now()}`,
      firebaseUid: String(firebaseUid),
      name: fallbackName,
      displayName: cleanDisplayName || fallbackName,
      username,
      email: cleanEmail,
      photoURL: cleanPhotoURL,
      provider: cleanProvider,
      passwordHash: "",
      role: "user",
      status: "active",
      lastLoginAt: new Date(),
      badges: ["New Challenger"],
      solvedProblemIds: [],
      attemptedProblemIds: [],
      stats: { totalSubmissions: 0, acceptedSubmissions: 0, waCount: 0, reCount: 0, tleCount: 0 }
    };
    memoryUsers.push(user);
  } else {
    user.firebaseUid = String(firebaseUid);
    if (cleanDisplayName) {
      user.displayName = cleanDisplayName;
    } else {
      user.displayName = user.displayName || user.name || fallbackName;
    }
    user.name = user.name || user.displayName || fallbackName;
    user.email = cleanEmail;
    if (cleanPhotoURL) {
      user.photoURL = cleanPhotoURL;
    }
    user.provider = cleanProvider;
    user.lastLoginAt = new Date();
  }

  return sanitizeUser(user);
}

export async function findUserByUsername(username) {
  if (!username) return null;
  await connectDatabase().catch(() => {});
  const cleanUser = username.trim().toLowerCase();

  if (isDatabaseConnected()) {
    try {
      const doc = await User.findOne({
        username: { $regex: new RegExp(`^${cleanUser.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&")}$`, "i") }
      }).lean();
      if (doc) return sanitizeUser(doc);
    } catch (e) {
      console.error("[UserStore] findUserByUsername DB error:", e);
      if (isProduction) throw persistenceUnavailable();
    }
  }

  const u = memoryUsers.find((item) => item.username?.toLowerCase() === cleanUser);
  return u ? sanitizeUser(u) : null;
}

export async function findUserById(id) {
  if (!id) return null;
  await connectDatabase().catch(() => {});

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
      if (isProduction) throw persistenceUnavailable();
    }
  }

  const u = memoryUsers.find((item) => String(item.id) === String(id) || String(item._id) === String(id));
  return u ? sanitizeUser(u) : null;
}

export async function isUsernameAvailable(username, currentUserId = null) {
  if (!username) return false;
  await connectDatabase().catch(() => {});
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
      if (isProduction) throw persistenceUnavailable();
    }
  }

  const found = memoryUsers.find(
    (u) => u.username.toLowerCase() === clean && String(u.id) !== String(currentUserId) && String(u._id) !== String(currentUserId)
  );
  return !found;
}

export async function createUser({ name, username, email, password, firebaseUid = "", photoURL = "" }) {
  await connectDatabase().catch(() => {});
  const hashedPassword = await hashPassword(password);
  const userObj = {
    id: `u-${Date.now()}`,
    name: name.trim(),
    displayName: name.trim(),
    username: username.trim().toLowerCase(),
    email: email.trim().toLowerCase(),
    firebaseUid: firebaseUid ? String(firebaseUid) : undefined,
    photoURL,
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
    streak: 0,
    bestStreak: 0,
    lastActiveDate: null,
    activeDates: [],
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
      if (isProduction) throw persistenceUnavailable();
    }
  }

  if (isProduction) throw persistenceUnavailable();
  memoryUsers.push(userObj);
  return sanitizeUser(userObj);
}

export async function updateUserProfile(userId, updateData) {
  if (!userId) return null;
  await connectDatabase().catch(() => {});

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
  if (typeof updateData.photoURL === "string") {
    allowedFields.photoURL = updateData.photoURL.trim();
    allowedFields.avatarUrl = updateData.photoURL.trim();
  }
  if (typeof updateData.avatarUrl === "string") {
    allowedFields.avatarUrl = updateData.avatarUrl.trim();
    allowedFields.photoURL = updateData.avatarUrl.trim();
  }
  if (typeof updateData.location === "string") {
    allowedFields.location = updateData.location.trim().slice(0, 100);
  }
  if (typeof updateData.github === "string") {
    allowedFields.github = updateData.github.trim().slice(0, 200);
  }
  if (typeof updateData.linkedin === "string") {
    allowedFields.linkedin = updateData.linkedin.trim().slice(0, 200);
  }
  if (typeof updateData.website === "string") {
    allowedFields.website = updateData.website.trim().slice(0, 200);
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
  await connectDatabase().catch(() => {});
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
  await connectDatabase().catch(() => {});

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

export async function softDeleteUser(userId) {
  if (!userId) return false;
  await connectDatabase().catch(() => {});

  if (isDatabaseConnected()) {
    try {
      const isObjId = mongoose.Types.ObjectId.isValid(String(userId));
      const query = isObjId ? { $or: [{ id: String(userId) }, { _id: userId }] } : { id: String(userId) };
      const res = await User.updateOne(query, { $set: { isDeleted: true, deletedAt: new Date() } });
      return res.modifiedCount > 0;
    } catch (e) {
      console.error("[UserStore] softDeleteUser DB error:", e);
    }
  }

  const u = memoryUsers.find(
    (item) => String(item.id) === String(userId) || String(item._id) === String(userId)
  );
  if (u) {
    u.isDeleted = true;
    u.deletedAt = new Date();
    return true;
  }

  return false;
}

export async function restoreUser(userId) {
  if (!userId) return false;
  await connectDatabase().catch(() => {});

  if (isDatabaseConnected()) {
    try {
      const isObjId = mongoose.Types.ObjectId.isValid(String(userId));
      const query = isObjId ? { $or: [{ id: String(userId) }, { _id: userId }] } : { id: String(userId) };
      const res = await User.updateOne(query, { $set: { isDeleted: false, deletedAt: null } });
      return res.modifiedCount > 0;
    } catch (e) {
      console.error("[UserStore] restoreUser DB error:", e);
    }
  }

  const u = memoryUsers.find(
    (item) => String(item.id) === String(userId) || String(item._id) === String(userId)
  );
  if (u) {
    u.isDeleted = false;
    u.deletedAt = null;
    return true;
  }

  return false;
}

/**
 * Record user submission verdict and update solved/attempted problem IDs, stats, and real streak permanently
 */
export async function recordUserSubmission(userId, problemId, verdict, points = 10) {
  if (!userId || !problemId) return null;
  await connectDatabase().catch(() => {});

  const isAc = verdict === "AC" || verdict === "OK" || verdict === "Accepted";
  const todayKey = formatDateKey(new Date());

  if (isDatabaseConnected()) {
    try {
      const isObjId = mongoose.Types.ObjectId.isValid(String(userId));
      const query = isObjId ? { $or: [{ id: String(userId) }, { _id: userId }] } : { id: String(userId) };

      // Find user to check if problem was already solved
      const existingUser = await User.findOne(query).lean();
      if (existingUser) {
        const isFirstTimeSolve = isAc && !(existingUser.solvedProblemIds || []).includes(String(problemId));
        const xpEarned = isFirstTimeSolve ? (Number(points) || 10) * 10 : 0;

        const mongoUpdate = {
          $addToSet: { attemptedProblemIds: String(problemId) },
          $inc: { "stats.totalSubmissions": 1 }
        };

        if (isAc) {
          mongoUpdate.$addToSet.solvedProblemIds = String(problemId);
          mongoUpdate.$addToSet.activeDates = todayKey;
          mongoUpdate.$inc["stats.acceptedSubmissions"] = 1;
          if (xpEarned > 0) {
            mongoUpdate.$inc.xp = xpEarned;
          }
          mongoUpdate.$set = { lastActiveDate: todayKey };
        } else if (verdict === "WA") {
          mongoUpdate.$inc["stats.waCount"] = 1;
        } else if (verdict === "RE") {
          mongoUpdate.$inc["stats.reCount"] = 1;
        } else if (verdict === "TLE") {
          mongoUpdate.$inc["stats.tleCount"] = 1;
        } else if (verdict === "CE") {
          mongoUpdate.$inc["stats.ceCount"] = 1;
        }

        const doc = await User.findOneAndUpdate(query, mongoUpdate, { new: true }).lean();
        if (doc) {
          // Recalculate streak from activeDates set
          const activeDatesList = doc.activeDates || (isAc ? [todayKey] : []);
          const streakResult = calculateUserStreak(activeDatesList, new Date());

          await User.updateOne(query, {
            $set: {
              streak: streakResult.currentStreak,
              bestStreak: Math.max(doc.bestStreak || 0, streakResult.bestStreak)
            }
          });

          const updatedDoc = {
            ...doc,
            streak: streakResult.currentStreak,
            bestStreak: Math.max(doc.bestStreak || 0, streakResult.bestStreak)
          };

          console.log(`[UserStore] Updated user '${userId}' stats: AC=${isAc}, firstTime=${isFirstTimeSolve}, streak=${streakResult.currentStreak}, bestStreak=${streakResult.bestStreak}`);
          return sanitizeUser(updatedDoc);
        }
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
      const isFirstTimeSolve = !(user.solvedProblemIds || []).includes(String(problemId));
      const xpEarned = isFirstTimeSolve ? (Number(points) || 10) * 10 : 0;

      const solved = new Set(user.solvedProblemIds || []);
      solved.add(String(problemId));
      user.solvedProblemIds = Array.from(solved);

      const activeDates = new Set(user.activeDates || []);
      activeDates.add(todayKey);
      user.activeDates = Array.from(activeDates);
      user.lastActiveDate = todayKey;

      const streakResult = calculateUserStreak(user.activeDates, new Date());
      user.streak = streakResult.currentStreak;
      user.bestStreak = Math.max(user.bestStreak || 0, streakResult.bestStreak);

      user.stats.acceptedSubmissions = (user.stats.acceptedSubmissions || 0) + 1;
      if (xpEarned > 0) {
        user.xp = (user.xp || 0) + xpEarned;
      }
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
  await connectDatabase().catch(() => {});
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
      if (isProduction) throw persistenceUnavailable();
    }
  }

  if (!rawUser) {
    rawUser = memoryUsers.find(
      (u) => u.email?.toLowerCase() === clean || u.username?.toLowerCase() === clean
    );
  }

  if (!rawUser) return null;

  const pwdHash = rawUser.passwordHash || rawUser.password;
  const isValid = await verifyPassword(password, pwdHash);
  if (isValid) {
    return sanitizeUser(rawUser);
  }

  return null;
}

export async function verifyUserRawPassword(userId, currentPassword) {
  if (!userId || !currentPassword) return false;
  await connectDatabase().catch(() => {});

  let rawUser = null;
  if (isDatabaseConnected()) {
    try {
      const isObjId = mongoose.Types.ObjectId.isValid(String(userId));
      const query = isObjId ? { $or: [{ id: String(userId) }, { _id: userId }] } : { id: String(userId) };
      rawUser = await User.findOne(query).lean();
    } catch (e) {
      console.error("[UserStore] verifyUserRawPassword DB error:", e);
      if (isProduction) throw persistenceUnavailable();
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
    name: safeUser.name || safeUser.displayName || safeUser.username || getEmailDerivedName(safeUser.email) || "User",
    displayName: safeUser.displayName || safeUser.name || "",
    username: safeUser.username || "",
    email: safeUser.email || "",
    photoURL: safeUser.photoURL || "",
    firebaseUid: safeUser.firebaseUid || "",
    provider: safeUser.provider || "password",
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
      showContestRanking: true
    },
    role: safeUser.role || "user",
    status: safeUser.status || "active",
    suspendedReason: safeUser.suspendedReason || "",
    streak: typeof safeUser.streak === "number" ? safeUser.streak : (safeUser.solvedProblemIds?.length > 0 ? 1 : 0),
    bestStreak: typeof safeUser.bestStreak === "number" ? safeUser.bestStreak : (safeUser.streak || 0),
    lastActiveDate: safeUser.lastActiveDate || null,
    activeDates: Array.isArray(safeUser.activeDates) ? safeUser.activeDates : [],
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

export async function getAllUsers({
  page = 1,
  limit = 20,
  search = "",
  role = "",
  status = "",
  sortBy = "createdAt",
  sortOrder = "desc"
} = {}) {
  await connectDatabase().catch(() => {});
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 20));
  const skip = (pageNum - 1) * limitNum;

  if (isDatabaseConnected()) {
    try {
      const query = {};
      if (role && role !== "all") query.role = role;
      if (status && status !== "all") query.status = status;
      if (search) {
        const regex = new RegExp(search.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&"), "i");
        query.$or = [{ name: regex }, { username: regex }, { email: regex }];
      }

      const sort = {};
      sort[sortBy] = sortOrder === "asc" ? 1 : -1;

      const [docs, total] = await Promise.all([
        User.find(query).sort(sort).skip(skip).limit(limitNum).lean(),
        User.countDocuments(query)
      ]);

      return {
        users: docs.map(sanitizeUser),
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum)
        }
      };
    } catch (e) {
      console.error("[UserStore] getAllUsers DB error:", e);
    }
  }

  // Memory fallback
  let filtered = [...memoryUsers];
  if (role && role !== "all") filtered = filtered.filter((u) => (u.role || "user") === role);
  if (status && status !== "all") filtered = filtered.filter((u) => (u.status || "active") === status);
  if (search) {
    const s = search.toLowerCase();
    filtered = filtered.filter(
      (u) =>
        u.name?.toLowerCase().includes(s) ||
        u.username?.toLowerCase().includes(s) ||
        u.email?.toLowerCase().includes(s)
    );
  }

  filtered.sort((a, b) => {
    const aVal = a[sortBy] || 0;
    const bVal = b[sortBy] || 0;
    if (sortOrder === "asc") return aVal > bVal ? 1 : -1;
    return aVal < bVal ? 1 : -1;
  });

  const total = filtered.length;
  const paginated = filtered.slice(skip, skip + limitNum);

  return {
    users: paginated.map(sanitizeUser),
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum)
    }
  };
}

export async function updateUserRole(id, newRole) {
  if (!id || !["user", "admin", "superadmin"].includes(newRole)) return null;
  await connectDatabase().catch(() => {});

  if (isDatabaseConnected()) {
    try {
      const isObjId = mongoose.Types.ObjectId.isValid(String(id));
      const query = isObjId ? { $or: [{ id: String(id) }, { _id: id }] } : { id: String(id) };
      const doc = await User.findOneAndUpdate(query, { role: newRole }, { new: true }).lean();
      if (doc) return sanitizeUser(doc);
    } catch (e) {
      console.error("[UserStore] updateUserRole DB error:", e);
    }
  }

  const u = memoryUsers.find((item) => String(item.id) === String(id) || String(item._id) === String(id));
  if (u) {
    u.role = newRole;
    return sanitizeUser(u);
  }
  return null;
}

export async function updateUserStatus(id, newStatus, suspendedReason = "") {
  if (!id || !["active", "suspended"].includes(newStatus)) return null;
  await connectDatabase().catch(() => {});

  if (isDatabaseConnected()) {
    try {
      const isObjId = mongoose.Types.ObjectId.isValid(String(id));
      const query = isObjId ? { $or: [{ id: String(id) }, { _id: id }] } : { id: String(id) };
      const doc = await User.findOneAndUpdate(
        query,
        { status: newStatus, suspendedReason: newStatus === "suspended" ? suspendedReason : "" },
        { new: true }
      ).lean();
      if (doc) return sanitizeUser(doc);
    } catch (e) {
      console.error("[UserStore] updateUserStatus DB error:", e);
    }
  }

  const u = memoryUsers.find((item) => String(item.id) === String(id) || String(item._id) === String(id));
  if (u) {
    u.status = newStatus;
    u.suspendedReason = newStatus === "suspended" ? suspendedReason : "";
    return sanitizeUser(u);
  }
  return null;
}
