import Image from "next/image";
import Link from "next/link";
import { Product } from "@/lib/types";
import { formatPrice } from "@/lib/utils";

function Badge({ text, tone }: { text: string; tone: "dark" | "soft" | "alert" }) {
  const styles = {
    dark: "bg-black text-white",
    soft: "bg-zinc-100 text-zinc-700",
    alert: "bg-amber-100 text-amber-800"
  };
  return <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider ${styles[tone]}`}>{text}</span>;
}

export function ProductCard({ product }: { product: Product }) {
  const isLimited = product.stock <= 6;

  return (
    <Link href={`/produit/${product.id}`} className="group block overflow-hidden rounded-2xl border border-zinc-200 bg-white transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(0,0,0,0.10)]">
      <div className="relative aspect-[4/5] overflow-hidden bg-zinc-100">
        <Image src={product.images[0]} alt={product.name} fill sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw" className="object-cover transition duration-700 group-hover:scale-105" />
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          {product.featured ? <Badge text="Nouveau" tone="soft" /> : null}
          {product.bestSeller ? <Badge text="Best Seller" tone="dark" /> : null}
          {isLimited ? <Badge text="Stock Limite" tone="alert" /> : null}
        </div>
      </div>
      <div className="space-y-2 p-4">
        <p className="text-[11px] uppercase tracking-[0.2em] text-zinc-500">{product.category}</p>
        <p className="line-clamp-1 font-semibold text-zinc-900">{product.name}</p>
        <div className="flex items-center justify-between">
          <p className="text-base font-bold text-zinc-900">{formatPrice(product.price)}</p>
          <span className="rounded-full border border-zinc-300 px-3 py-1 text-xs text-zinc-700 transition group-hover:bg-black group-hover:text-white">Voir details</span>
        </div>
      </div>
    </Link>
  );
}
