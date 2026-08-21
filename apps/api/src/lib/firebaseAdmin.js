import { createRemoteJWKSet, jwtVerify } from "jose";

const firebaseKeys = createRemoteJWKSet(
  new URL("https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com")
);

/**
 * Verifies and decodes a Firebase ID token.
 * Extracts standard Firebase token claims: uid, name, email, picture, etc.
 *
 * @param {string} idToken
 * @returns {Promise<{ uid: string, email: string, name: string, picture: string } | null>}
 */
export async function verifyFirebaseIdToken(idToken) {
  if (!idToken || typeof idToken !== "string") {
    return null;
  }

  try {
    const projectId = process.env.FIREBASE_PROJECT_ID?.trim();
    if (!projectId) throw new Error("FIREBASE_PROJECT_ID is not configured.");

    const { payload } = await jwtVerify(idToken, firebaseKeys, {
      algorithms: ["RS256"],
      audience: projectId,
      issuer: `https://securetoken.google.com/${projectId}`
    });
    const uid = payload.user_id || payload.sub;
    const email = payload.email || "";
    const name = payload.name || "";
    const picture = payload.picture || "";

    if (!uid || !email || payload.email_verified !== true || !payload.auth_time) return null;

    return {
      uid: String(uid),
      email: String(email).toLowerCase(),
      name: String(name).trim(),
      picture: String(picture)
    };
  } catch (err) {
    console.warn("[FirebaseAdmin] Firebase ID token verification failed:", err.message);
    return null;
  }
}
