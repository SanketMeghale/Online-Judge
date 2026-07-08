import { user as mockUser } from "../data/mockData.js";

function buildSession(profile) {
  return {
    accessToken: `mock-jwt-${Date.now()}`,
    user: {
      ...mockUser,
      ...profile
    }
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

  return buildSession({ email });
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

  return buildSession({
    name: name.trim(),
    username: username.trim(),
    email
  });
}

export async function refreshCurrentSession(session) {
  const accessToken = session?.accessToken ?? session?.token;

  if (!accessToken) {
    return null;
  }

  return {
    ...session,
    accessToken,
    token: undefined,
    user: {
      ...mockUser,
      ...session.user
    }
  };
}
