import { Metadata } from "next";
import { AdminPage } from "@/components/sections/commerce/admin-page";

export const metadata: Metadata = { title: "Dashboard Admin" };
export default function Page() { return <AdminPage />; }
