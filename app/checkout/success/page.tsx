import { Metadata } from "next";
import { CheckoutSuccessPage } from "@/components/sections/commerce/checkout-success-page";

export const metadata: Metadata = { title: "Paiement confirme" };

export default function Page() {
  return <CheckoutSuccessPage />;
}
