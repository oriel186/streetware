import { Metadata } from "next";
import { AboutPage } from "@/components/sections/about-page";

export const metadata: Metadata = {
  title: "A propos",
  description: "Vision et mission de VENDEUR KASHER 770."
};

export default function Page() {
  return <AboutPage />;
}
