import { Metadata } from "next";
import { CartPage } from "@/components/sections/commerce/cart-page";

export const metadata: Metadata = { title: "Panier" };
export default function Page() { return <CartPage />; }
