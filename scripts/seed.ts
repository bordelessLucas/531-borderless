/**
 * Popula o Firestore do projeto (ou emulador) com os dados de seed.
 *
 * Sem Cloud Functions e sem service account (plano Spark):
 *   1) sobe rules de bootstrap (escrita liberada)
 *   2) grava via Client SDK
 *   3) restaura rules definitivas
 *
 * Uso (projeto real):
 *   npm run seed
 *
 * Uso (emulador):
 *   npm run emulators
 *   FIRESTORE_EMULATOR_HOST=127.0.0.1:8080 npm run seed
 */
import { execSync } from "node:child_process";
import { copyFileSync, existsSync, renameSync } from "node:fs";
import { initializeApp, deleteApp, getApps } from "firebase/app";
import {
  connectFirestoreEmulator,
  doc,
  getFirestore,
  setDoc,
  type Firestore,
} from "firebase/firestore";
import { COLLECTIONS } from "../src/lib/firebase/collections";
import {
  seedAttractions,
  seedFulfillments,
  seedOrders,
  seedPartners,
  seedProducts,
  seedSites,
  seedTicketTypes,
} from "../src/lib/seed/data";

const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "gustavo-c049a";
const RULES_PATH = "firestore.rules";
const RULES_BACKUP = "firestore.rules.seed-backup";
const BOOTSTRAP_RULES = "firestore.bootstrap.rules";

const useEmulator = Boolean(process.env.FIRESTORE_EMULATOR_HOST);

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Env ausente: ${name}. Preencha .env.local.`);
  return value;
}

function deployRules(): void {
  console.log("→ Deploy das rules...");
  execSync(
    `npx -y firebase-tools@latest deploy --only firestore:rules --project ${PROJECT_ID}`,
    { stdio: "inherit" },
  );
}

function withBootstrapRules<T>(fn: () => Promise<T>): Promise<T> {
  if (useEmulator) return fn();

  if (!existsSync(BOOTSTRAP_RULES)) {
    throw new Error(`Arquivo ${BOOTSTRAP_RULES} não encontrado.`);
  }

  copyFileSync(RULES_PATH, RULES_BACKUP);
  copyFileSync(BOOTSTRAP_RULES, RULES_PATH);

  return fn()
    .catch((err) => {
      throw err;
    })
    .finally(() => {
      if (existsSync(RULES_BACKUP)) {
        renameSync(RULES_BACKUP, RULES_PATH);
      }
      try {
        deployRules();
      } catch (restoreErr) {
        console.error(
          "Falha ao restaurar rules definitivas. Rode manualmente: npm run firebase:rules",
          restoreErr,
        );
      }
    });
}

function getSeedDb(): Firestore {
  for (const app of getApps()) {
    void deleteApp(app);
  }

  const app = initializeApp({
    apiKey: requireEnv("NEXT_PUBLIC_FIREBASE_API_KEY"),
    authDomain: requireEnv("NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN"),
    projectId: requireEnv("NEXT_PUBLIC_FIREBASE_PROJECT_ID"),
    storageBucket: requireEnv("NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET"),
    messagingSenderId: requireEnv("NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID"),
    appId: requireEnv("NEXT_PUBLIC_FIREBASE_APP_ID"),
  });

  const db = getFirestore(app);

  if (useEmulator) {
    const host = process.env.FIRESTORE_EMULATOR_HOST ?? "127.0.0.1:8080";
    const [hostname, portRaw] = host.split(":");
    connectFirestoreEmulator(db, hostname ?? "127.0.0.1", Number(portRaw ?? 8080));
    console.log(`→ Usando emulador em ${host}`);
  }

  return db;
}

async function seedCollection<T extends { id: string }>(
  db: Firestore,
  name: string,
  docs: T[],
): Promise<void> {
  for (const item of docs) {
    const { id, ...data } = item;
    await setDoc(doc(db, name, id), { id, ...data });
  }
  console.log(`✓ ${name}: ${docs.length} documentos`);
}

async function runSeed(): Promise<void> {
  if (!useEmulator) {
    console.log("→ Publicando rules de bootstrap (escrita liberada)...");
    deployRules();
  }

  const db = getSeedDb();
  await seedCollection(db, COLLECTIONS.sites, seedSites);
  await seedCollection(db, COLLECTIONS.partners, seedPartners);
  await seedCollection(db, COLLECTIONS.attractions, seedAttractions);
  await seedCollection(db, COLLECTIONS.ticketTypes, seedTicketTypes);
  await seedCollection(db, COLLECTIONS.products, seedProducts);
  await seedCollection(db, COLLECTIONS.orders, seedOrders);
  await seedCollection(db, COLLECTIONS.fulfillments, seedFulfillments);

  const adminEmails = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  const operatorEmails = (process.env.OPERATOR_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  await setDoc(doc(db, COLLECTIONS.config, "staff"), {
    adminEmails,
    operatorEmails,
    updatedAt: new Date().toISOString(),
  });
  console.log(
    `✓ config/staff: ${adminEmails.length} admin(s), ${operatorEmails.length} operator(s)`,
  );
  console.log("Seed concluído.");
}

async function main(): Promise<void> {
  await withBootstrapRules(runSeed);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
