import type { Metadata } from "next";
import "./globals.css";
import { SiteHeader } from "@/components/shared/site-header";
import { SiteFooter } from "@/components/shared/site-footer";
import { Toaster } from "@/components/ui/toaster";
import { StoreProvider } from "@/lib/store";
import { AuthProvider } from "@/lib/auth";
import { WhatsAppFloat } from "@/components/shared/whatsapp-float";

export const metadata: Metadata = {
  metadataBase: new URL("https://vendeur-kasher-770.example"),
  title: { default: "VENDEUR KASHER 770", template: "%s | VENDEUR KASHER 770" },
  description: "Boutique premium streetwear luxe VENDEUR KASHER 770. Paiement carte ou especes a la livraison.",
  openGraph: {
    title: "VENDEUR KASHER 770",
    description: "Boutique premium streetwear luxe.",
    url: "https://vendeur-kasher-770.example",
    siteName: "VENDEUR KASHER 770",
    locale: "fr_FR",
    type: "website",
    images: ["/kasher-logo.png"]
  },
  icons: {
    icon: "/kasher-logo.png",
    shortcut: "/kasher-logo.png",
    apple: "/kasher-logo.png"
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="bg-background font-sans text-foreground antialiased">
        <AuthProvider>
          <StoreProvider>
            <div className="fixed inset-0 -z-10 bg-glow" />
            <div className="fixed inset-0 -z-10 bg-grain bg-[size:14px_14px] opacity-40" />
            <SiteHeader />
            <main>{children}</main>
            <SiteFooter />
            <WhatsAppFloat />
            <Toaster />
          </StoreProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
