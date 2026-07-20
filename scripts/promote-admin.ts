/**
 * Promove um usuário a admin/operator no Firestore (role no doc users/).
 * Necessário no plano Spark (sem Functions) para isStaff() nas rules.
 *
 * Uso:
 *   npx tsx --env-file=.env.local scripts/promote-admin.ts --uid=<UID> --role=admin
 *
 * O UID aparece em Authentication no Console Firebase após o primeiro login.
 */
import { execSync } from "node:child_process";
import { copyFileSync, existsSync, renameSync } from "node:fs";
import { initializeApp, deleteApp, getApps } from "firebase/app";
import { doc, getFirestore, setDoc } from "firebase/firestore";
import { COLLECTIONS } from "../src/lib/firebase/collections";

const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "gustavo-c049a";
const RULES_PATH = "firestore.rules";
const RULES_BACKUP = "firestore.rules.seed-backup";
const BOOTSTRAP_RULES = "firestore.bootstrap.rules";

function arg(name: string): string | undefined {
  const prefix = `--${name}=`;
  return process.argv.find((a) => a.startsWith(prefix))?.slice(prefix.length);
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Env ausente: ${name}`);
  return value;
}

function deployRules(): void {
  execSync(
    `npx -y firebase-tools@latest deploy --only firestore:rules --project ${PROJECT_ID}`,
    { stdio: "inherit" },
  );
}

async function main() {
  const uid = arg("uid");
  const role = arg("role") ?? "admin";
  if (!uid) throw new Error("Informe --uid=<firebaseAuthUid>");
  if (role !== "admin" && role !== "operator") {
    throw new Error("--role deve ser admin ou operator");
  }

  copyFileSync(RULES_PATH, RULES_BACKUP);
  copyFileSync(BOOTSTRAP_RULES, RULES_PATH);
  try {
    console.log("→ Bootstrap rules...");
    deployRules();

    for (const app of getApps()) await deleteApp(app);
    const app = initializeApp({
      apiKey: requireEnv("NEXT_PUBLIC_FIREBASE_API_KEY"),
      authDomain: requireEnv("NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN"),
      projectId: requireEnv("NEXT_PUBLIC_FIREBASE_PROJECT_ID"),
      storageBucket: requireEnv("NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET"),
      messagingSenderId: requireEnv("NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID"),
      appId: requireEnv("NEXT_PUBLIC_FIREBASE_APP_ID"),
    });
    const db = getFirestore(app);
    const now = new Date().toISOString();
    await setDoc(
      doc(db, COLLECTIONS.users, uid),
      { role, updatedAt: now },
      { merge: true },
    );
    console.log(`✓ users/${uid} → role=${role}`);
  } finally {
    if (existsSync(RULES_BACKUP)) renameSync(RULES_BACKUP, RULES_PATH);
    console.log("→ Restaurando rules...");
    deployRules();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
