"use client";

import Image from "next/image";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { formatPrice } from "@/lib/utils";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/reveal";

export function CartPage() {
  const { cart, cartTotal, updateQty, removeItem } = useStore();

  return (
    <div className="container space-y-8 pb-16 pt-6 sm:pb-20 sm:pt-8">
      <Reveal><h1 className="font-display text-5xl sm:text-6xl">Panier</h1></Reveal>
      {cart.length === 0 ? (
        <Reveal>
          <div className="rounded-3xl border border-zinc-200 bg-white p-12 text-center shadow-sm">
            <p className="text-xl font-semibold text-zinc-800">Votre panier est vide</p>
            <p className="mt-2 text-zinc-600">Ajoutez vos pièces favorites pour continuer.</p>
            <Link href="/boutique" className="mt-6 inline-block rounded-full bg-black px-6 py-3 text-sm font-semibold text-white">Voir la boutique</Link>
          </div>
        </Reveal>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_370px]">
          <Stagger className="space-y-3">
            {cart.map((item, idx) => (
              <StaggerItem key={`${item.productId}-${idx}`}>
                <div className="grid gap-4 rounded-2xl border border-zinc-200 bg-white p-4 transition hover:shadow-sm md:grid-cols-[110px_1fr_auto]">
                  <div className="relative aspect-square overflow-hidden rounded-xl bg-zinc-100"><Image src={item.image} alt={item.name} fill className="object-cover" /></div>
                  <div>
                    <p className="font-semibold text-zinc-900">{item.name}</p>
                    <p className="mt-1 text-sm text-zinc-600">Taille : {item.size} | Pointure : {item.shoeSize} | Couleur : {item.color}</p>
                    <p className="mt-2 text-sm font-semibold">{formatPrice(item.price)}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center gap-2 rounded-full border border-zinc-300 px-2 py-1"><button onClick={() => updateQty(idx, item.quantity - 1)} className="h-7 w-7 rounded-full hover:bg-zinc-100">-</button><span className="w-8 text-center text-sm font-semibold">{item.quantity}</span><button onClick={() => updateQty(idx, item.quantity + 1)} className="h-7 w-7 rounded-full hover:bg-zinc-100">+</button></div>
                    <button onClick={() => removeItem(idx)} className="text-xs text-zinc-500 hover:text-black">Supprimer</button>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </Stagger>

          <Reveal>
            <aside className="h-fit rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
              <p className="text-sm uppercase tracking-[0.2em] text-zinc-500">Résumé commande</p>
              <p className="mt-3 text-4xl font-bold text-zinc-900">{formatPrice(cartTotal)}</p>
              <p className="mt-2 text-sm text-zinc-600">Livraison calculée à la confirmation.</p>
              <Link href="/checkout" className="mt-6 block rounded-full bg-black px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-zinc-800">Passer au checkout</Link>
            </aside>
          </Reveal>
        </div>
      )}
    </div>
  );
}
