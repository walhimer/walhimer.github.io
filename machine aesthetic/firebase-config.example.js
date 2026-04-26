/**
 * Copy to firebase-config.local.js (gitignored) and paste your web app config.
 * Do not commit real keys to a public repo — use Firebase Console → Realtime Database
 * / Firestore → Rules to restrict read/write (keys alone are not secret).
 *
 * import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
 */
export const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  databaseURL: "https://YOUR_PROJECT-default-rtdb.firebaseio.com",
  projectId: "YOUR_PROJECT",
  storageBucket: "YOUR_PROJECT.firebasestorage.app",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
