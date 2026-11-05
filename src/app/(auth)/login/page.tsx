import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { LoginForm } from "@/components/auth-form";

export const metadata: Metadata = {
  title: "Войти",
  description:
    "Вход в личный кабинет CheApi: управление API-ключами, балансом токенов и историей запросов.",
  alternates: { canonical: "/login" },
  robots: { index: false, follow: false },
};

export default async function LoginPage() {
  const user = await getSessionUser();
  if (user) redirect("/dashboard");

  return <LoginForm />;
}
