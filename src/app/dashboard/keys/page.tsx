import type { Metadata } from "next";
import { requireUser, getApiKeys } from "@/lib/auth";
import { PageHead } from "@/components/dashboard-ui";
import { KeysManager } from "@/components/keys-manager";

export const metadata: Metadata = { title: "API-ключи" };

export default async function KeysPage() {
  const user = await requireUser();
  const keys = getApiKeys(user.id).map((key) => ({
    id: key.id,
    name: key.name,
    prefix: key.prefix,
    last4: key.last4,
    created_at: key.created_at,
    last_used_at: key.last_used_at,
    revoked_at: key.revoked_at,
  }));

  return (
    <div className="grid gap-6">
      <PageHead
        eyebrow="Доступ"
        title="API-ключи"
        description="Ключи открывают доступ к API от вашего имени. Создавайте отдельные ключи для инструментов и отзывайте те, которые больше не нужны."
      />
      <KeysManager initialKeys={keys} />
    </div>
  );
}
