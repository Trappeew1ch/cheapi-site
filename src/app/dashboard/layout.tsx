import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { DashboardShell } from "@/components/dashboard-shell";

export const metadata: Metadata = {
  title: { default: "Личный кабинет", template: "%s — CheApi" },
  robots: { index: false, follow: false },
};

export default async function DashboardLayout({ children }: LayoutProps<"/">) {
  const user = await requireUser();

  return (
    <DashboardShell
      user={{
        email: user.email,
        balance_tokens: user.balance_tokens,
        role: user.role,
      }}
    >
      {children}
    </DashboardShell>
  );
}
