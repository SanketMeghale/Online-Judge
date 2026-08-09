import admin from "firebase-admin";

function getServiceAccountCredential() {
  const rawJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (rawJson) {
    try {
      return admin.credential.cert(JSON.parse(rawJson));
    } catch (error) {
      console.error("[Firebase Admin] Invalid FIREBASE_SERVICE_ACCOUNT_JSON:", error);
    }
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (projectId && clientEmail && privateKey) {
    return admin.credential.cert({ projectId, clientEmail, privateKey });
  }

  return admin.credential.applicationDefault();
}

function getFirebaseAdminApp() {
  if (admin.apps.length > 0) {
    return admin.app();
  }

  return admin.initializeApp({
    credential: getServiceAccountCredential(),
    projectId: process.env.FIREBASE_PROJECT_ID || process.env.GCLOUD_PROJECT
  });
}

export async function verifyFirebaseIdToken(idToken) {
  const app = getFirebaseAdminApp();
  return app.auth().verifyIdToken(idToken);
}
