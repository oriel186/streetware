import { Metadata } from "next";
import { ContactPage } from "@/components/sections/contact-page";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contactez VENDEUR KASHER 770 et commandez via WhatsApp."
};

export default function Page() {
  return <ContactPage />;
}
