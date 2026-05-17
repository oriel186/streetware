import { Metadata } from "next";
import { AuthPage } from "@/components/sections/auth/auth-page";

export const metadata: Metadata = { title: "Connexion" };
export default function Page() { return <AuthPage />; }
