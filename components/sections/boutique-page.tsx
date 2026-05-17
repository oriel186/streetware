"use client";

import { useEffect, useMemo, useState } from "react";
import { ProductCard } from "@/components/shared/product-card";
import { ProductSkeleton } from "@/components/shared/product-skeleton";
import { Input } from "@/components/ui/input";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/reveal";
import { Product } from "@/lib/types";

export function BoutiquePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [size, setSize] = useState("all");
  const [color, setColor] = useState("all");
  const [stockOnly, setStockOnly] = useState(false);
  const [sort, setSort] = useState("featured");

  useEffect(() => {
    fetch("/api/products").then((r) => r.json()).then((d) => setProducts((d.products || []) as Product[]));
  }, []);

  const categories: string[] = Array.from(new Set(products.map((p) => p.category)));
  const allSizes: string[] = Array.from(new Set(products.flatMap((p) => [...p.sizes, ...p.shoeSizes])));
  const allColors: string[] = Array.from(new Set(products.flatMap((p) => p.colors)));

  const filtered = useMemo(() => {
    let list = products.filter((p) =>
      p.name.toLowerCase().includes(query.toLowerCase()) &&
      (category === "all" || p.category === category) &&
      (size === "all" || p.sizes.includes(size) || p.shoeSizes.includes(size)) &&
      (color === "all" || p.colors.includes(color)) &&
      (!stockOnly || p.stock > 0)
    );
    if (sort === "price-asc") list = [...list].sort((a, b) => a.price - b.price);
    if (sort === "price-desc") list = [...list].sort((a, b) => b.price - a.price);
    if (sort === "name") list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }, [products, query, category, size, color, stockOnly, sort]);

  return (
    <div className="container space-y-6 pb-16 pt-6 sm:space-y-8 sm:pb-20 sm:pt-8">
      <Reveal>
        <h1 className="font-display text-5xl sm:text-6xl">Boutique</h1>
      </Reveal>

      <Reveal>
        <div className="grid gap-3 rounded-2xl border border-zinc-200 bg-white p-4 md:grid-cols-6">
          <Input placeholder="Rechercher un produit" value={query} onChange={(e) => setQuery(e.target.value)} className="md:col-span-2" />
          <select className="h-11 rounded-xl border border-zinc-300 bg-white px-3 text-sm" value={category} onChange={(e) => setCategory(e.target.value)}><option value="all">Catégorie</option>{categories.map((c) => <option key={c} value={c}>{c}</option>)}</select>
          <select className="h-11 rounded-xl border border-zinc-300 bg-white px-3 text-sm" value={size} onChange={(e) => setSize(e.target.value)}><option value="all">Taille</option>{allSizes.map((s) => <option key={s} value={s}>{s}</option>)}</select>
          <select className="h-11 rounded-xl border border-zinc-300 bg-white px-3 text-sm" value={color} onChange={(e) => setColor(e.target.value)}><option value="all">Couleur</option>{allColors.map((c) => <option key={c} value={c}>{c}</option>)}</select>
          <select className="h-11 rounded-xl border border-zinc-300 bg-white px-3 text-sm" value={sort} onChange={(e) => setSort(e.target.value)}><option value="featured">Tri</option><option value="price-asc">Prix croissant</option><option value="price-desc">Prix décroissant</option><option value="name">Nom</option></select>
          <label className="md:col-span-6 flex items-center gap-2 text-sm text-zinc-700"><input type="checkbox" checked={stockOnly} onChange={(e) => setStockOnly(e.target.checked)} /> Produits disponibles uniquement</label>
        </div>
      </Reveal>

      {!products.length && <div className="grid grid-cols-2 gap-4 md:grid-cols-4">{Array.from({ length: 8 }).map((_, i) => <ProductSkeleton key={i} />)}</div>}

      {filtered.length === 0 ? (
        <Reveal><div className="rounded-2xl border border-zinc-200 p-10 text-center text-zinc-600">Aucun produit ne correspond à vos filtres.</div></Reveal>
      ) : (
        <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{filtered.map((p) => <StaggerItem key={p.id}><ProductCard product={p} /></StaggerItem>)}</Stagger>
      )}
    </div>
  );
}


