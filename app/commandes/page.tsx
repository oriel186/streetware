import { Metadata } from "next";
import { OrdersPage } from "@/components/sections/commerce/orders-page";

export const metadata: Metadata = { title: "Commandes" };
export default function Page() { return <OrdersPage />; }
