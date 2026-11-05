import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { MODELS } from "@/lib/models";
import { PageHead } from "@/components/dashboard-ui";
import { Playground } from "@/components/playground";

export const metadata: Metadata = { title: "Песочница" };

export default async function PlaygroundPage() {
  const user = await requireUser();
  const chatModels = MODELS.filter((model) => model.kind === "chat").map((model) => ({
    id: model.id,
    name: model.name,
    family: model.family,
  }));

  return (
    <div className="grid gap-6">
      <PageHead
        eyebrow="Тест"
        title="Песочница"
        description="Отправьте запрос к модели прямо из кабинета. Это тот же API, что вы будете использовать в коде, — с реальным списанием токенов."
      />
      <Playground models={chatModels} balance={user.balance_tokens} rate={user.rate_rub_per_m} />
    </div>
  );
}
