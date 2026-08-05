import { api } from "../api/apiClient.js";
import { createUserRecord, ensureDatabase, findUserByEmail, findUserById, writeDatabase } from "../data/appData.js";

function assertEmail(email) {
  if (!email || !email.includes("@")) {
    throw new Error("Enter a valid email address.");
  }
}

function assertPassword(password) {
  if (!password || password.length < 6) {
    throw new Error("Password must be at least 6 characters.");
  }
}

export async function loginWithEmail({ email, password }) {
  assertEmail(email);
  assertPassword(password);

  try {
    const res = await api.login({ email, password });
    return {
      accessToken: res.token,
      user: res.user
    };
  } catch (err) {
    // If backend is unavailable or fails, fallback to local storage authentication
    const database = ensureDatabase();
    const user = findUserByEmail(database, email);

    if (!user || user.password !== password) {
      throw new Error(err.message || "Invalid email or password.");
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
      accessToken: res.token,
      user: res.user
    };
  } catch (err) {
    // Fallback to local database storage if backend API is not available
    const database = ensureDatabase();

    if (findUserByEmail(database, email)) {
      throw new Error("An account with this email already exists.");
    }

    const existingUsername = database.users.find(
      (user) => user.username.toLowerCase() === username.trim().toLowerCase()
    );

    if (existingUsername) {
      throw new Error("That username is already taken.");
    }

    const user = createUserRecord({ name, username, email, password });
    const nextDatabase = {
      ...database,
      users: [...database.users, user]
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
