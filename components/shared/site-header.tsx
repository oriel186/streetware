"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useStore } from "@/lib/store";
import { BrandLogo } from "@/components/shared/brand-logo";

const links = [
  { href: "/", label: "Accueil" },
  { href: "/boutique", label: "Boutique" },
  { href: "/commandes", label: "Commandes" },
  { href: "/a-propos", label: "À propos" },
  { href: "/contact", label: "Contact" }
];

export function SiteHeader() {
  const pathname = usePathname();
  const { cartCount } = useStore();

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/90 backdrop-blur-xl">
      <div className="container flex h-20 items-center justify-between gap-2 sm:gap-4">
        <Link href="/" className="flex min-w-0 items-center gap-2 sm:gap-3">
          <BrandLogo size={52} />
          <span className="truncate font-display text-xl tracking-wide sm:text-3xl">VENDEUR KASHER 770</span>
        </Link>
        <nav className="hidden items-center gap-1 rounded-full border border-zinc-300 bg-white p-1 lg:flex">
          {links.map((link) => <Link key={link.href} href={link.href} className={cn("rounded-full px-4 py-1.5 text-sm text-zinc-600 transition", pathname === link.href ? "bg-black text-white" : "hover:text-black")}>{link.label}</Link>)}
        </nav>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <Link href="/auth" className="rounded-full border border-zinc-300 px-3 py-2 text-[11px] sm:text-xs">Compte</Link>
          <Link href="/panier" className="rounded-full bg-black px-3 py-2 text-[11px] font-semibold text-white sm:text-xs">Panier ({cartCount})</Link>
        </div>
      </div>
    </header>
  );
}
