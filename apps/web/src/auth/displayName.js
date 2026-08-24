export function getEmailDerivedName(email) {
  return String(email || "")
    .split("@")[0]
    .replace(/[._-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Resolves user display name following strict priority:
 * 1. user.displayName
 * 2. user.name
 * 3. user.username
 * 4. email-derived name
 * 5. fallback
 */
export function getUserDisplayName(user, { short = false, fallback = "User" } = {}) {
  if (!user || typeof user !== "object") return fallback;

  const displayName = typeof user.displayName === "string" ? user.displayName.trim() : "";
  if (displayName) {
    return short ? displayName.split(" ")[0] : displayName;
  }

  const name = typeof user.name === "string" ? user.name.trim() : "";
  if (name) {
    return short ? name.split(" ")[0] : name;
  }

  const username = typeof user.username === "string" ? user.username.trim() : "";
  if (username) {
    return short ? username.split(" ")[0] : username;
  }

  const emailName = getEmailDerivedName(user.email);
  if (emailName) {
    const capitalized = emailName.charAt(0).toUpperCase() + emailName.slice(1);
    return short ? capitalized.split(" ")[0] : capitalized;
  }

  return fallback;
}
