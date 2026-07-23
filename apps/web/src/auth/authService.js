import { createUserRecord, ensureDatabase, findUserByEmail, findUserById, writeDatabase } from "../data/appData.js";

function buildSession(user) {
  return {
    accessToken: `mock-jwt-${Date.now()}`,
    user
  };
}

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

  const database = ensureDatabase();
  const user = findUserByEmail(database, email);

  if (!user || user.password !== password) {
    throw new Error("Invalid email or password.");
  }

  return buildSession(user);
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

  return buildSession(user);
}

export async function refreshCurrentSession(session) {
  const accessToken = session?.accessToken ?? session?.token;
  const userId = session?.user?.id;

  if (!accessToken || !userId) {
    return null;
  }

  const database = ensureDatabase();
  const user = findUserById(database, userId);

  if (!user) {
    return null;
  }

  return {
    accessToken,
    user
  };
}
