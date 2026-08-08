import { api } from "../api/apiClient.js";
import { createUserRecord, ensureDatabase, findUserByEmail, findUserById, writeDatabase } from "../data/appData.js";

function assertIdentifier(identifier) {
  if (!identifier || !identifier.trim()) {
    throw new Error("Enter your email address or username.");
  }
}

function assertEmail(email) {
  if (!email || !email.includes("@")) {
    throw new Error("Please enter a valid email address.");
  }
}

function assertPassword(password) {
  if (!password || password.length < 6) {
    throw new Error("Password must be at least 6 characters.");
  }
}

export async function loginWithEmail({ email, username, password }) {
  const identifier = (email || username || "").trim();
  assertIdentifier(identifier);
  assertPassword(password);

  try {
    const res = await api.login({ email: identifier, username: identifier, password });
    return {
      accessToken: res.token || res.accessToken,
      user: res.user
    };
  } catch (err) {
    // If backend provided an explicit rejection, throw it
    if (err.message && !err.message.includes("Failed to fetch") && !err.message.includes("NetworkError")) {
      throw err;
    }

    // Fallback to local storage only if offline/network failed
    const database = ensureDatabase();
    const clean = identifier.toLowerCase();
    const user = database.users?.find(
      (u) => u.email?.toLowerCase() === clean || (u.username && u.username.toLowerCase() === clean)
    );

    if (!user || user.password !== password) {
      throw new Error(err.message || "Invalid email/username or password.");
    }

    return {
      accessToken: `mock-jwt-${Date.now()}`,
      user
    };
  }
}

export async function registerWithEmail({ name, username, email, password }) {
  if (!name?.trim()) {
    throw new Error("Enter your full name.");
  }

  if (!username?.trim()) {
    throw new Error("Choose a username.");
  }

  assertEmail(email);
  assertPassword(password);

  try {
    const res = await api.register({ name, username, email, password });
    return {
      accessToken: res.token || res.accessToken,
      user: res.user
    };
  } catch (err) {
    // Always propagate server-side validation & duplicate user errors
    if (err.message && !err.message.includes("Failed to fetch") && !err.message.includes("NetworkError")) {
      throw err;
    }

    // Fallback to local database storage if network is truly offline
    const database = ensureDatabase();

    if (findUserByEmail(database, email)) {
      throw new Error("An account with this email already exists.");
    }

    const existingUsername = database.users?.find(
      (user) => user.username?.toLowerCase() === username.trim().toLowerCase()
    );

    if (existingUsername) {
      throw new Error("That username is already taken.");
    }

    const user = createUserRecord({ name, username, email, password });
    const nextDatabase = {
      ...database,
      users: [...(database.users || []), user]
    };

    writeDatabase(nextDatabase);

    return {
      accessToken: `mock-jwt-${Date.now()}`,
      user
    };
  }
}

export async function refreshCurrentSession(session) {
  const accessToken = session?.accessToken ?? session?.token;
  if (!accessToken) return null;

  try {
    const res = await api.getMe();
    if (res && res.user) {
      return {
        accessToken,
        user: res.user
      };
    }
  } catch {
    // Fallback for dev mode / offline backend
  }

  const userId = session?.user?.id;
  if (!userId) return session;

  const database = ensureDatabase();
  const user = findUserById(database, userId);

  return {
    accessToken,
    user: user || session.user
  };
}
