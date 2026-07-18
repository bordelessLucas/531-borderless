import "server-only";
import {
  getApps,
  initializeApp,
  cert,
  applicationDefault,
  type App,
} from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

/**
 * Admin SDK para uso EXCLUSIVO no servidor (server actions, rotas, seed).
 * Em dev usa o emulador (FIRESTORE_EMULATOR_HOST); em prod, service account.
 */
function initAdmin(): App {
  if (getApps().length) return getApps()[0]!;

  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "onerio-dev";

  // Emulador: não exige credenciais reais, só o projectId.
  if (process.env.FIRESTORE_EMULATOR_HOST) {
    return initializeApp({ projectId });
  }

  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (raw) {
    const serviceAccount = JSON.parse(raw);
    return initializeApp({ credential: cert(serviceAccount), projectId });
  }

  // Ambiente com credenciais padrão do Google (Cloud Run, etc.).
  return initializeApp({ credential: applicationDefault(), projectId });
}

export function getAdminDb(): Firestore {
  return getFirestore(initAdmin());
}
