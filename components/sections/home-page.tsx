"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { ProductCard } from "@/components/shared/product-card";
import { BrandLogo } from "@/components/shared/brand-logo";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/reveal";
import { WeeklySelectionSlider } from "@/components/sections/weekly-selection-slider";
import { Product } from "@/lib/types";

function weeklyGroup(p: Product) {
  const name = p.name.toLowerCase();
  if (name.includes("watch") || name.includes("montre")) return 5;
  if (name.includes("beanie") || name.includes("bonnet")) return 3;
  if (p.category === "Sneakers") return 2;
  if (p.category === "Hoodies" || p.category === "T-Shirts" || p.category === "Pants") return 1;
  return 4;
}

export function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  useEffect(() => {
    fetch("/api/products").then((r) => r.json()).then((d) => setProducts(d.products || []));
  }, []);
  const featured = useMemo(() => products.filter((p) => p.featured).slice(0, 4), [products]);
  const best = useMemo(() => products.filter((p) => p.bestSeller).slice(0, 4), [products]);
  const weekly = useMemo(
    () => [...products].sort((a, b) => (weeklyGroup(a) - weeklyGroup(b)) || a.name.localeCompare(b.name, "fr")).slice(0, 20),
    [products]
  );
  const heroA = products[0]?.images?.[0] || "/products/001-whatsapp-image-2026-05-14-at-20-34-26-1.jpeg";
  const heroB = products[1]?.images?.[0] || "/products/002-whatsapp-image-2026-05-14-at-20-34-26-2.jpeg";
  return (
    <div className="container space-y-14 pb-16 pt-6 sm:space-y-20 sm:pb-20 sm:pt-8">
      <Reveal>
        <section className="relative overflow-hidden rounded-3xl border border-zinc-200 bg-white p-5 shadow-[0_30px_60px_rgba(0,0,0,0.08)] sm:p-8 lg:p-12">
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-zinc-100 blur-3xl" />
          <div className="grid items-center gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10">
            <div className="space-y-5 sm:space-y-6">
              <div className="flex items-center gap-3">
                <BrandLogo size={64} />
                <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-zinc-500 sm:text-xs sm:tracking-[0.35em]">VENDEUR KASHER 770</p>
              </div>
              <h1 className="font-display text-4xl leading-[0.92] sm:text-6xl lg:text-8xl">Collection Streetwear
                <span className="mt-1 block text-zinc-500">Premium Edition</span>
              </h1>
              <p className="max-w-xl text-base text-zinc-700 sm:text-lg">Des sneakers fortes, des coupes premium et une boutique fiable pour commander rapidement en toute confiance.</p>
              <div className="flex flex-wrap gap-2.5 sm:gap-3">
                <Link href="/boutique" className="rounded-full bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800 sm:px-7 sm:py-3.5">Voir la boutique</Link>
                <Link href="/checkout" className="rounded-full border border-zinc-300 px-5 py-3 text-sm font-semibold text-zinc-900 transition hover:border-black hover:bg-black hover:text-white sm:px-7 sm:py-3.5">Commander maintenant</Link>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="relative aspect-[3/4] overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-100"><Image src={heroA} alt="Produit premium" fill className="object-cover" /></div>
              <div className="space-y-3">
                <div className="relative aspect-square overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-100"><Image src={heroB} alt="Sneaker premium" fill className="object-cover" /></div>
                <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4"><p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Slogan</p><p className="mt-1 text-sm font-semibold text-zinc-800">Luxe urbain. Détails nets. Impact immédiat.</p></div>
              </div>
            </div>
          </div>
        </section>
      </Reveal>

      <Reveal>
        <section>
          <div className="mb-5 flex items-end justify-between sm:mb-6"><h2 className="font-display text-3xl sm:text-4xl">Nouveautés</h2><Link href="/boutique" className="text-sm text-zinc-600 hover:text-black">Voir tout</Link></div>
          <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{featured.map((p) => <StaggerItem key={p.id}><ProductCard product={p} /></StaggerItem>)}</Stagger>
        </section>
      </Reveal>

      <Reveal>
        <section className="rounded-2xl border border-zinc-200 bg-white p-5 sm:p-8">
          <h3 className="font-display text-3xl sm:text-4xl">Best-sellers</h3>
          <Stagger className="mt-5 grid gap-4 sm:mt-6 sm:grid-cols-2 lg:grid-cols-4">{best.map((p) => <StaggerItem key={p.id}><ProductCard product={p} /></StaggerItem>)}</Stagger>
        </section>
      </Reveal>

      <WeeklySelectionSlider items={weekly} />
    </div>
  );
}
