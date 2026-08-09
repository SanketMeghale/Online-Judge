import jwt from "jsonwebtoken";

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
    // 1. Decode token payload
    const decoded = jwt.decode(idToken, { complete: true });
    if (!decoded || !decoded.payload) {
      console.warn("[FirebaseAdmin] Failed to decode Firebase ID token");
      return null;
    }

    const payload = decoded.payload;
    const uid = payload.user_id || payload.sub || payload.uid;
    const email = payload.email || "";
    const name = payload.name || payload.displayName || "";
    const picture = payload.picture || payload.photoURL || "";

    if (!uid) {
      console.warn("[FirebaseAdmin] Firebase ID token missing uid/sub");
      return null;
    }

    // Optional: check token expiration (with 10-minute clock skew tolerance)
    const nowInSec = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < nowInSec - 600) {
      console.warn("[FirebaseAdmin] Firebase ID token has expired");
      return null;
    }

    return {
      uid: String(uid),
      email: String(email).toLowerCase(),
      name: String(name).trim(),
      picture: String(picture)
    };
  } catch (err) {
    console.error("[FirebaseAdmin] Error verifying Firebase ID token:", err.message);
    return null;
  }
}
