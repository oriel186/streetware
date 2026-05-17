import Link from "next/link";
import { BrandLogo } from "@/components/shared/brand-logo";

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-zinc-200 bg-white py-12">
      <div className="container grid gap-8 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-3"><BrandLogo size={44} /><p className="font-display text-2xl">VENDEUR KASHER 770</p></div>
          <p className="mt-2 text-sm text-zinc-600">Streetwear luxe premium. Boutique officielle.</p>
        </div>
        <div><p className="mb-2 text-sm uppercase tracking-[0.2em] text-zinc-500">Boutique</p><p className="text-sm text-zinc-700"><Link href="/boutique">Voir la boutique</Link></p><p className="text-sm text-zinc-700"><Link href="/panier">Panier</Link></p><p className="text-sm text-zinc-700"><Link href="/checkout">Commande</Link></p></div>
        <div><p className="mb-2 text-sm uppercase tracking-[0.2em] text-zinc-500">Contact</p><p className="text-sm text-zinc-700">WhatsApp : +33 7 58 18 79 03</p><p className="text-sm text-zinc-700">support@vendeurkasher770.com</p><p className="text-sm text-zinc-700">Instagram : @vendeurkasher770</p></div>
        <div><p className="mb-2 text-sm uppercase tracking-[0.2em] text-zinc-500">Infos</p><p className="text-sm text-zinc-700">Livraison 48h/72h</p><p className="text-sm text-zinc-700">Paiement carte / espèces</p><p className="text-sm text-zinc-700">Mentions légales</p></div>
      </div>
      <div className="container mt-8 border-t border-zinc-200 pt-4 text-xs text-zinc-500">© {new Date().getFullYear()} VENDEUR KASHER 770. Tous droits réservés.</div>
    </footer>
  );
}
