import { Metadata } from "next";
import { CheckoutPage } from "@/components/sections/commerce/checkout-page";

export const metadata: Metadata = { title: "Checkout" };
export default function Page() { return <CheckoutPage />; }
