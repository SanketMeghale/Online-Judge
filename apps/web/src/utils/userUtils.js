/**
 * Production-ready user identity and display name utilities for Judgo.
 * Follows the strict priority:
 * 1. user.displayName
 * 2. user.name
 * 3. user.username
 * 4. email-derived name
 * 5. "User"
 */

export function getUserDisplayName(user, { short = false, fallback = "User" } = {}) {
  if (!user || typeof user !== "object") {
    return fallback;
  }

  const rawDisplayName = typeof user.displayName === "string" ? user.displayName.trim() : "";
  const rawName = typeof user.name === "string" ? user.name.trim() : "";
  const rawUsername = typeof user.username === "string" ? user.username.trim() : "";
  const rawEmail = typeof user.email === "string" ? user.email.trim() : "";

  let resolved = "";

  if (rawDisplayName) {
    resolved = rawDisplayName;
  } else if (rawName && rawName !== "User" && rawName !== "Coder") {
    resolved = rawName;
  } else if (rawUsername && rawUsername !== "demouser" && rawUsername !== "guest_coder") {
    resolved = rawUsername;
  } else if (rawEmail) {
    const emailPrefix = rawEmail.split("@")[0].replace(/[._-]+/g, " ").trim();
    resolved = emailPrefix ? emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1) : "";
  }

  if (!resolved) {
    resolved = rawName || rawUsername || fallback;
  }

  if (short && resolved) {
    // Return first name or single token
    return resolved.split(" ")[0] || resolved;
  }

  return resolved || fallback;
}

export function getUserAvatarUrl(user) {
  if (!user || typeof user !== "object") return "";
  return String(user.photoURL || user.avatar || user.picture || "").trim();
}

export function getUserInitials(user) {
  const name = getUserDisplayName(user, { fallback: "U" });
  const parts = name.split(" ").filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}
