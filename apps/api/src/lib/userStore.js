import mongoose from "mongoose";
import { connectDatabase, isDatabaseConnected } from "./db.js";
import { hashPassword, hashPasswordSync, verifyPassword } from "./jwt.js";
import { User } from "../models/User.js";
import { calculateUserStreak, formatDateKey } from "./streakEngine.js";

const DEFAULT_SEED_USERS = [
  {
    id: "u-admin",
    name: "Platform Administrator",
    username: "admin",
    email: "admin@judgo.dev",
    passwordHash: hashPasswordSync("admin123"),
    bio: "Judgo System Administrator",
    role: "admin",
    status: "active",
    suspendedReason: "",
    language: "en-US",
    timezone: "UTC",
    ranking: 1,
    xp: 9999,
    streak: 30,
    bestStreak: 100,
    badges: ["Platform Administrator", "Algorithm Pioneer"],
    solvedProblemIds: ["two-sum", "valid-parentheses", "palindrome-number"],
    attemptedProblemIds: ["two-sum", "valid-parentheses", "palindrome-number"],
    activeDates: [formatDateKey(new Date())],
    stats: {
      totalSubmissions: 100,
      acceptedSubmissions: 95,
      waCount: 4,
      reCount: 1,
      tleCount: 0
    },
    createdAt: new Date("2026-01-01")
  },
  {
    id: "u-sanketmeghale",
    name: "Sanket Meghale",
    username: "sanketmeghale",
    email: "sanket@example.com",
    passwordHash: hashPasswordSync("password123"),
    bio: "Full Stack & Algorithms Engineer",
    role: "admin",
    status: "active",
    suspendedReason: "",
    language: "en-US",
    timezone: "UTC+5:30 (IST)",
    ranking: 14,
    xp: 2450,
    streak: 5,
    bestStreak: 12,
    badges: ["New Challenger", "Three Problem Sprint", "Algorithm Pioneer"],
    solvedProblemIds: ["two-sum", "valid-parentheses", "palindrome-number"],
    attemptedProblemIds: ["two-sum", "valid-parentheses", "palindrome-number", "reverse-linked-list"],
    activeDates: [formatDateKey(new Date())],
    stats: {
      totalSubmissions: 28,
      acceptedSubmissions: 22,
      waCount: 4,
      reCount: 1,
      tleCount: 1
    },
    createdAt: new Date("2026-01-01")
  },
  {
    id: "u-demouser",
    name: "Judgo Demo Coder",
    username: "demouser",
    email: "demo@judgo.dev",
    passwordHash: hashPasswordSync("password123"),
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
    passwordHash: hashPasswordSync("password123"),
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
    passwordHash: hashPasswordSync("password123"),
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
    passwordHash: hashPasswordSync("password123"),
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

const memoryUsers = [...DEFAULT_SEED_USERS];

export async function findUserByEmail(email) {
  if (!email) return null;
  await connectDatabase();
  const cleanEmail = email.trim().toLowerCase();

  if (isDatabaseConnected()) {
    try {
      const doc = await User.findOne({ email: cleanEmail }).lean();
      if (doc) return sanitizeUser(doc);
    } catch (e) {
      console.error("[UserStore] findUserByEmail DB error:", e);
    }
  }

  const u = memoryUsers.find((item) => item.email?.toLowerCase() === cleanEmail);
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
      if (doc) return sanitizeUser(doc);
    } catch (e) {
      console.error("[UserStore] findUserByUsername DB error:", e);
    }
  }

  const u = memoryUsers.find((item) => item.username?.toLowerCase() === cleanUser);
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

  memoryUsers.push(userObj);

  if (isDatabaseConnected()) {
    try {
      const doc = await User.create(userObj);
      console.log(`[UserStore] User '${email || username}' successfully created in MongoDB Atlas.`);
      return sanitizeUser(doc.toObject());
    } catch (e) {
      console.error("[UserStore] createUser DB error:", e);
    }
  }

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
 * Record user submission verdict and update solved/attempted problem IDs, stats, and real streak permanently
 */
export async function recordUserSubmission(userId, problemId, verdict, points = 10) {
  if (!userId || !problemId) return null;
  await connectDatabase();

  const isAc = verdict === "AC" || verdict === "OK" || verdict === "Accepted";
  const xpEarned = isAc ? (Number(points) || 10) * 10 : 0;
  const todayKey = formatDateKey(new Date());

  const mongoUpdate = {
    $addToSet: { attemptedProblemIds: String(problemId) },
    $inc: { "stats.totalSubmissions": 1 }
  };

  if (isAc) {
    mongoUpdate.$addToSet.solvedProblemIds = String(problemId);
    mongoUpdate.$addToSet.activeDates = todayKey;
    mongoUpdate.$inc["stats.acceptedSubmissions"] = 1;
    mongoUpdate.$inc.xp = xpEarned;
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

  if (isDatabaseConnected()) {
    try {
      const isObjId = mongoose.Types.ObjectId.isValid(String(userId));
      const query = isObjId ? { $or: [{ id: String(userId) }, { _id: userId }] } : { id: String(userId) };

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

        console.log(`[UserStore] Updated user '${userId}' stats: AC=${isAc}, streak=${streakResult.currentStreak}, bestStreak=${streakResult.bestStreak}`);
        return sanitizeUser(updatedDoc);
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

      const activeDates = new Set(user.activeDates || []);
      activeDates.add(todayKey);
      user.activeDates = Array.from(activeDates);
      user.lastActiveDate = todayKey;

      const streakResult = calculateUserStreak(user.activeDates, new Date());
      user.streak = streakResult.currentStreak;
      user.bestStreak = Math.max(user.bestStreak || 0, streakResult.bestStreak);

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
      (u) => u.email?.toLowerCase() === clean || u.username?.toLowerCase() === clean
    );
  }

  // Auto-provision social login users if they log in via social providers (Google/GitHub/GitLab)
  if (!rawUser && (clean.startsWith("coder_") || clean.includes("@judgo.dev"))) {
    const providerName = clean.replace(/@.*$/, "").replace(/^coder_/, "") || "Developer";
    const displayName = providerName.charAt(0).toUpperCase() + providerName.slice(1) + " Developer";
    try {
      const newUser = await createUser({
        name: displayName,
        username: clean.replace(/@.*$/, ""),
        email: clean.includes("@") ? clean : `${clean}@judgo.dev`,
        password
      });
      return newUser;
    } catch (e) {}
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
  await connectDatabase();
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
  if (!id || !["user", "admin"].includes(newRole)) return null;
  await connectDatabase();

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
  await connectDatabase();

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

