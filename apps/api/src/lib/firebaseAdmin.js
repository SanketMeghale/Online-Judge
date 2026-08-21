import { createRemoteJWKSet, jwtVerify } from "jose";

const firebaseKeys = createRemoteJWKSet(
  new URL("https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com")
);

// Firebase project IDs are public identifiers. This default mirrors the web
// client's checked-in fallback and keeps serverless authentication operational
// when only the browser-side Firebase variables were configured in Vercel.
const DEFAULT_FIREBASE_PROJECT_ID = "judgo-d908b";

export function getFirebaseProjectId() {
  return (
    process.env.FIREBASE_PROJECT_ID?.trim() ||
    process.env.VITE_FIREBASE_PROJECT_ID?.trim() ||
    DEFAULT_FIREBASE_PROJECT_ID
  );
}

/**
 * Verifies and decodes a Firebase ID token.
 * Extracts standard Firebase token claims: uid, name, email, picture, provider, etc.
 *
 * @param {string} idToken
 * @returns {Promise<{ uid: string, email: string, name: string, picture: string, provider: string } | null>}
 */
export async function verifyFirebaseIdToken(idToken) {
  if (!idToken || typeof idToken !== "string") {
    return null;
  }

  try {
    const projectId = getFirebaseProjectId();

    const { payload } = await jwtVerify(idToken, firebaseKeys, {
      algorithms: ["RS256"],
      audience: projectId,
      issuer: `https://securetoken.google.com/${projectId}`
    });
    const uid = payload.user_id || payload.sub;
    const email = payload.email || "";
    const name = payload.name || "";
    const picture = payload.picture || "";
    const provider = payload.firebase?.sign_in_provider || "google.com";

    if (!uid) return null;

    return {
      uid: String(uid),
      email: String(email).toLowerCase(),
      name: String(name).trim(),
      picture: String(picture),
      provider: String(provider)
    };
  } catch (err) {
    console.warn("[FirebaseAdmin] Firebase ID token verification failed:", err.message);
    return null;
  }
}

