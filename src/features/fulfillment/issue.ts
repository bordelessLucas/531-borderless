"use client";

import { doc, updateDoc } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { getDb, getFirebaseStorage } from "@/lib/firebase/client";
import { COLLECTIONS } from "@/lib/firebase/collections";
import type { TicketAsset } from "@/features/fulfillment/types";

export async function uploadTicketPdf(input: {
  orderId: string;
  fulfillmentId: string;
  file: File;
  handledByUid: string;
}): Promise<{ asset: TicketAsset }> {
  if (input.file.type !== "application/pdf" && !input.file.type.startsWith("image/")) {
    throw new Error("Envie um PDF ou imagem do bilhete.");
  }
  if (input.file.size > 15 * 1024 * 1024) {
    throw new Error("Arquivo maior que 15 MB.");
  }

  const safeName = input.file.name.replace(/[^\w.\-]+/g, "_");
  const path = `tickets/${input.orderId}/${input.fulfillmentId}/${Date.now()}-${safeName}`;
  const storageRef = ref(getFirebaseStorage(), path);
  await uploadBytes(storageRef, input.file, { contentType: input.file.type });
  const url = await getDownloadURL(storageRef);

  const asset: TicketAsset = {
    id: `${input.fulfillmentId}-${Date.now()}`,
    url,
    fileName: input.file.name,
  };

  const now = new Date().toISOString();
  await updateDoc(doc(getDb(), COLLECTIONS.fulfillments, input.fulfillmentId), {
    ticketAssets: [asset],
    status: "ISSUED",
    handledByUid: input.handledByUid,
    updatedAt: now,
  });

  return { asset };
}

export async function markFulfillmentIssued(input: {
  fulfillmentId: string;
  handledByUid: string;
}): Promise<void> {
  const now = new Date().toISOString();
  await updateDoc(doc(getDb(), COLLECTIONS.fulfillments, input.fulfillmentId), {
    status: "ISSUED",
    handledByUid: input.handledByUid,
    updatedAt: now,
  });
}
