export function getEmailDerivedName(email) {
  return String(email || "")
    .split("@")[0]
    .replace(/[._-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function getUserDisplayName(user) {
  const displayName = String(user?.displayName || "").trim();
  if (displayName) return displayName;

  const username = String(user?.username || "").trim();
  if (username) return username;

  const emailName = getEmailDerivedName(user?.email);
  return emailName || "User";
}
