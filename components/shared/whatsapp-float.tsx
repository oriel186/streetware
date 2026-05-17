"use client";

import Link from "next/link";

const WA_PHONE = "33758187903";
const message = encodeURIComponent("Bonjour VENDEUR KASHER 770, je souhaite plus d'informations sur vos produits.");

export function WhatsAppFloat() {
  return (
    <Link href={`https://wa.me/${WA_PHONE}?text=${message}`} target="_blank" className="fixed bottom-5 right-5 z-50 rounded-full bg-black px-4 py-3 text-sm font-semibold text-white shadow-xl">
      WhatsApp
    </Link>
  );
}
