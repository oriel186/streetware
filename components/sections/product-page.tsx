"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ProductCard } from "@/components/shared/product-card";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toaster";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/reveal";
import { useStore } from "@/lib/store";
import { useAuth } from "@/lib/auth";
import { Product } from "@/lib/types";
import { formatPrice, whatsappLink } from "@/lib/utils";

const WA_PHONE = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "33758187903";

export function ProductPage({ product, similarProducts }: { product: Product; similarProducts: Product[] }) {
  const router = useRouter();
  const { addToCart } = useStore();
  const { user } = useAuth();
  const [activeImage, setActiveImage] = useState(product.images[0]);
  const [zoom, setZoom] = useState(false);
  const [size, setSize] = useState(product.sizes[0] || "Unique");
  const [shoeSize, setShoeSize] = useState(product.shoeSizes[0] || "N/A");
  const [color, setColor] = useState(product.colors[0] || "Noir");
  const [qty, setQty] = useState(1);
  const similar = useMemo(() => similarProducts.slice(0, 4), [similarProducts]);

  const addCurrent = () => {
    if (!user) {
      toast({ title: "Connexion requise", description: "Inscrivez-vous ou connectez-vous avant d'acheter." });
      router.push("/auth");
      return;
    }
    addToCart({ productId: product.id, name: product.name, price: product.price, image: product.images[0], size, shoeSize, color, quantity: qty });
    toast({ title: "Ajouté au panier", description: `${product.name} a été ajouté.` });
  };

  const orderNow = () => { addCurrent(); router.push("/checkout"); };
  const message = `Bonjour VENDEUR KASHER 770, je souhaite commander:\n- Produit: ${product.name}\n- Taille: ${size}\n- Pointure: ${shoeSize}\n- Couleur: ${color}\n- Quantité: ${qty}\n- Prix: ${formatPrice(product.price * qty)}`;
  const waUrl = whatsappLink(WA_PHONE, message);

  return (
    <div className="container space-y-10 pb-16 pt-6 sm:space-y-12 sm:pb-20 sm:pt-8">
      <Reveal>
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-3">
            <button onClick={() => setZoom(true)} className="relative block aspect-[4/5] w-full overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-100">
              <Image src={activeImage} alt={product.name} fill className="object-cover transition duration-300 hover:scale-105" />
            </button>
            <div className="grid grid-cols-4 gap-2">{product.images.map((img) => <button key={img} onClick={() => setActiveImage(img)} className="relative aspect-square overflow-hidden rounded-xl border border-zinc-300"><Image src={img} alt={product.name} fill className="object-cover" /></button>)}</div>
          </div>

          <div className="space-y-5 rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6">
            <p className="text-xs uppercase tracking-[0.25em] text-zinc-500">{product.category}</p>
            <h1 className="font-display text-4xl leading-none sm:text-5xl">{product.name}</h1>
            <p className="text-2xl font-semibold">{formatPrice(product.price)}</p>
            <p className="text-zinc-700">{product.description}</p>
            <div className="space-y-3">
              <select value={size} onChange={(e) => setSize(e.target.value)} className="h-11 w-full rounded-xl border border-zinc-300 bg-white px-3">{product.sizes.map((s) => <option key={s}>{s}</option>)}</select>
              <select value={shoeSize} onChange={(e) => setShoeSize(e.target.value)} className="h-11 w-full rounded-xl border border-zinc-300 bg-white px-3">{(product.shoeSizes.length ? product.shoeSizes : ["N/A"]).map((s) => <option key={s}>{s}</option>)}</select>
              <select value={color} onChange={(e) => setColor(e.target.value)} className="h-11 w-full rounded-xl border border-zinc-300 bg-white px-3">{product.colors.map((c) => <option key={c}>{c}</option>)}</select>
              <div className="flex items-center gap-2"><button onClick={() => setQty((q) => Math.max(1, q - 1))} className="h-10 w-10 rounded-full border border-zinc-300">-</button><span className="w-10 text-center font-semibold">{qty}</span><button onClick={() => setQty((q) => q + 1)} className="h-10 w-10 rounded-full border border-zinc-300">+</button></div>
            </div>
            <p className="text-sm text-zinc-600">Stock : {Math.max(1, product.stock)} disponible(s)</p>
            <div className="grid gap-2 sm:grid-cols-2"><Button className="h-12 w-full text-base" onClick={addCurrent}>Ajouter au panier</Button><Button className="h-12 w-full border-zinc-300 bg-white text-zinc-900" onClick={orderNow}>Commander</Button></div>
            <Link href={waUrl} target="_blank" onClick={() => toast({ title: "WhatsApp", description: "Message pré-rempli généré." })}><Button className="h-12 w-full text-base">Commander sur WhatsApp</Button></Link>
            <div className="space-y-2 border-t border-zinc-200 pt-4 text-sm text-zinc-600"><p><span className="font-semibold text-zinc-800">Livraison :</span> 48 h à 72 h.</p><p><span className="font-semibold text-zinc-800">Retours :</span> 14 jours.</p></div>
          </div>
        </div>
      </Reveal>

      <Reveal>
        <section>
          <h2 className="mb-4 font-display text-3xl sm:text-4xl">Produits similaires</h2>
          <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{similar.map((p) => <StaggerItem key={p.id}><ProductCard product={p} /></StaggerItem>)}</Stagger>
        </section>
      </Reveal>

      {zoom ? <button onClick={() => setZoom(false)} className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4"><div className="relative h-[85vh] w-full max-w-4xl"><Image src={activeImage} alt={product.name} fill className="object-contain" /></div></button> : null}
    </div>
  );
}
