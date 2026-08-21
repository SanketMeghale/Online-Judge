import { api } from "../api/apiClient.js";

async function loadFirebaseAuth() {
  const [{ signInWithPopup }, firebase] = await Promise.all([
    import("firebase/auth"),
    import("../firebase/firebase.js")
  ]);
  return { signInWithPopup, ...firebase };
}

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
  if (!password || password.length < 12) {
    throw new Error("Password must be at least 12 characters.");
  }
}

export async function loginWithGoogle() {
  const { signInWithPopup, auth, googleProvider } = await loadFirebaseAuth();
  const result = await signInWithPopup(auth, googleProvider);
  const fbUser = result.user;

  const idToken = await fbUser.getIdToken();
  const res = await api.loginGoogle({ idToken });

  return {
    authenticated: true,
    user: {
      ...res.user,
      firebaseUid: res.user?.firebaseUid || fbUser.uid,
      displayName: res.user?.displayName || fbUser.displayName || "",
      email: res.user?.email || fbUser.email || "",
      photoURL: res.user?.photoURL || fbUser.photoURL || "",
      provider: res.user?.provider || fbUser.providerData?.[0]?.providerId || "google.com"
    }
  };
}

export async function loginWithGitHub() {
  const { signInWithPopup, auth, githubProvider } = await loadFirebaseAuth();
  const result = await signInWithPopup(auth, githubProvider);
  const fbUser = result.user;

  const idToken = await fbUser.getIdToken();

  const res = await api.loginGoogle({ idToken });

  return {
    authenticated: true,
    user: res.user
  };
}

export async function loginWithEmail(credentials = {}) {
  const { email, username, identifier: rawId, emailOrUsername, password } = credentials;
  const identifier = String(email || username || rawId || emailOrUsername || "").trim();
  assertIdentifier(identifier);
  assertPassword(password);

  try {
    const res = await api.login({ email: identifier, username: identifier, password });
    return {
      authenticated: true,
      user: res.user
    };
  } catch (err) {
    throw new Error(err.message || "Invalid email/username or password.");
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

  const res = await api.register({
    name: name.trim(),
    username: username.trim().toLowerCase(),
    email: email.trim().toLowerCase(),
    password
  });
  return {
    authenticated: true,
    user: res.user
  };
}

export async function refreshCurrentSession() {
  try {
    const res = await api.getMe();
    if (res && res.user) {
      return {
        authenticated: true,
        user: res.user
      };
    }
  } catch {}

  return null;
}
