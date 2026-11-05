import Image from "next/image";
import { FAMILIES, type FamilyId, type Model } from "@/lib/models";
import { cn } from "@/lib/format";

const FAMILY_ICONS: Record<FamilyId, string> = {
  gpt: "/icons/models/openai.svg",
  claude: "/icons/models/claude.svg",
  kimi: "/icons/models/kimi.svg",
  glm: "/icons/models/zhipu.svg",
  deepseek: "/icons/models/deepseek.svg",
};

const VENDOR_ICONS: Record<string, string> = {
  OpenAI: "/icons/models/openai.svg",
  Anthropic: "/icons/models/claude.svg",
  "Moonshot AI": "/icons/models/kimi.svg",
  "Z.ai": "/icons/models/zhipu.svg",
  DeepSeek: "/icons/models/deepseek.svg",
  Qwen: "/icons/models/qwen.svg",
};

export function modelIconSrc(model?: Model, family?: FamilyId): string {
  if (model && VENDOR_ICONS[model.vendor]) return VENDOR_ICONS[model.vendor];
  const id = family ?? model?.family ?? "gpt";
  return FAMILY_ICONS[id];
}

/**
 * Brand mark for a model or family. Real logos come from LobeHub Icons (MIT)
 * and are stored locally in /public/icons/models.
 */
export function ModelIcon({
  model,
  family,
  vendor,
  size = 32,
  className,
  plain = false,
}: {
  model?: Model;
  family?: FamilyId;
  vendor?: string;
  size?: number;
  className?: string;
  plain?: boolean;
}) {
  const id = family ?? model?.family ?? "gpt";
  const src =
    (vendor ? VENDOR_ICONS[vendor] : undefined) ?? modelIconSrc(model, family);

  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-grid shrink-0 place-items-center overflow-hidden rounded-[10px] border border-black/[0.06]",
        className,
      )}
      style={{
        width: size,
        height: size,
        backgroundColor: plain ? "#ffffff" : FAMILIES[id].accentSoft,
      }}
    >
      <Image
        src={src}
        alt=""
        width={size}
        height={size}
        unoptimized
        className="size-[62%] object-contain"
      />
    </span>
  );
}
