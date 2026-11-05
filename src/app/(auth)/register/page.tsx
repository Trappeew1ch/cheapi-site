import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { RegisterForm } from "@/components/auth-form";

export const metadata: Metadata = {
  title: "Создать аккаунт",
  description:
    "Регистрация в CheApi: 5 млн токенов в подарок, доступ ко всем AI-моделям через один API-ключ, оплата в рублях.",
  alternates: { canonical: "/register" },
  robots: { index: false, follow: false },
};

export default async function RegisterPage() {
  const user = await getSessionUser();
  if (user) redirect("/dashboard");

  return <RegisterForm />;
}
