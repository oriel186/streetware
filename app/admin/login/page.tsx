import { Metadata } from "next";
import { AdminLoginPage } from "@/components/sections/admin/admin-login-page";

export const metadata: Metadata = { title: "Admin Login" };

export default function Page() {
  return <AdminLoginPage />;
}
