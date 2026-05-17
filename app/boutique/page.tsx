import { Metadata } from "next";
import { BoutiquePage } from "@/components/sections/boutique-page";

export const metadata: Metadata = {
  title: "Boutique",
  description: "Decouvrez la selection premium VENDEUR KASHER 770."
};

export default function Page() {
  return <BoutiquePage />;
}
