"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { CustomerInfo } from "@/lib/types";

export function CheckoutSuccessPage() {
  const { cart, createOrder } = useStore();
  const done = useRef(false);

  useEffect(() => {
    if (done.current) return;
    const raw = sessionStorage.getItem("pending_customer");
    if (!raw || !cart.length) return;
    const customer = JSON.parse(raw) as CustomerInfo;
    createOrder(customer, "carte");
    sessionStorage.removeItem("pending_customer");
    done.current = true;
  }, [cart, createOrder]);

  return (
    <div className="container space-y-6 pb-20 pt-10">
      <h1 className="font-display text-6xl">Paiement confirme</h1>
      <div className="rounded-2xl border border-zinc-200 bg-white p-8">
        <p className="text-zinc-700">Merci, ton paiement Stripe est valide et la commande a ete enregistree.</p>
        <div className="mt-5 flex gap-3">
          <Link href="/commandes" className="rounded-full bg-black px-5 py-2.5 text-sm font-semibold text-white">Voir mes commandes</Link>
          <Link href="/boutique" className="rounded-full border border-zinc-300 px-5 py-2.5 text-sm">Continuer</Link>
        </div>
      </div>
    </div>
  );
}
