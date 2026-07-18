/**
 * Popula o Firestore (emulador ou projeto) com os dados de seed.
 *
 * Uso (emulador):
 *   npm run emulators           # em outro terminal
 *   FIRESTORE_EMULATOR_HOST=127.0.0.1:8080 npm run seed
 */
import { getAdminDb } from "../src/lib/firebase/admin";
import { COLLECTIONS } from "../src/lib/firebase/collections";
import {
  seedAttractions,
  seedFulfillments,
  seedPartners,
  seedProducts,
  seedSites,
  seedTicketTypes,
} from "../src/lib/seed/data";

async function seedCollection<T extends { id: string }>(
  name: string,
  docs: T[],
): Promise<void> {
  const db = getAdminDb();
  const batch = db.batch();
  for (const doc of docs) {
    batch.set(db.collection(name).doc(doc.id), doc);
  }
  await batch.commit();
  console.log(`✓ ${name}: ${docs.length} documentos`);
}

async function main(): Promise<void> {
  await seedCollection(COLLECTIONS.sites, seedSites);
  await seedCollection(COLLECTIONS.partners, seedPartners);
  await seedCollection(COLLECTIONS.attractions, seedAttractions);
  await seedCollection(COLLECTIONS.ticketTypes, seedTicketTypes);
  await seedCollection(COLLECTIONS.products, seedProducts);
  await seedCollection(COLLECTIONS.fulfillments, seedFulfillments);
  console.log("Seed concluído.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
