import { MODELS } from "@/lib/models";
import {
  DEFAULT_TOPUP_RUB,
  MAX_TOPUP_RUB,
  MIN_TOPUP_RUB,
  rateForRub,
  WELCOME_TOKENS,
} from "@/lib/pricing";
import { SITE } from "@/lib/site";

export const dynamic = "force-static";

export function GET() {
  const baseRate = rateForRub(DEFAULT_TOPUP_RUB);

  const models = MODELS.map((model) => {
    if (model.kind === "image") {
      const perImage = ((model.imageMinTokens ?? 177_400) * baseRate) / 1_000_000;
      return `| ${model.name} | ${model.id} | image | ${perImage.toFixed(2)} RUB per image |`;
    }
    return `| ${model.name} | ${model.id} | ${model.kind} | ${(baseRate * model.coef).toFixed(2)} RUB per 1M tokens |`;
  }).join("\n");

  const body = `# CheApi pricing

CheApi resells access to OpenAI, Anthropic, Z.ai, DeepSeek and Qwen models through an OpenAI- and Anthropic-compatible API. Prices are in Russian rubles. No subscription. Pay only for tokens actually used.

## Base rate
- Top-up amount: ${DEFAULT_TOPUP_RUB} RUB -> ${baseRate.toFixed(2)} RUB per 1,000,000 base tokens.
- Minimum top-up: ${MIN_TOPUP_RUB} RUB.
- Maximum top-up: ${MAX_TOPUP_RUB} RUB per operation.
- Welcome credit: ${WELCOME_TOKENS.toLocaleString("ru-RU")} tokens for a new account.
- Tokens do not expire.

## Billing formula
charged_base_tokens = ceil((input_tokens + output_tokens + cached_tokens * 0.4) * model_coefficient)
cost_rub = charged_base_tokens * base_rate / 1,000,000

- Cached input is charged at 40% of the normal input rate.
- Image generation: 177,400 base tokens per image; the model coefficient is not applied.
- Requests that fail without a model response are not charged.
- If the balance is insufficient, the API returns HTTP 402 and does not charge.

## Models
| Model | ID | Kind | Price |
| --- | --- | --- | --- |
${models}

## API
- OpenAI-compatible base URL: ${SITE.apiBase}
- Anthropic-compatible base URL: ${SITE.url}
- Chat: POST /v1/chat/completions
- Anthropic messages: POST /v1/messages
- Models: GET /v1/models
- Embeddings: POST /v1/embeddings
- Images: POST /v1/images/generations
- Audio: POST /v1/audio/transcriptions
- Auth: Authorization: Bearer che_sk_... or x-api-key
- Streaming: Server-Sent Events
- Default rate limit: 120 requests per minute per key

## Links
- Pricing page: ${SITE.url}/pricing
- Models: ${SITE.url}/models
- Docs: ${SITE.url}/docs
- Offer: ${SITE.url}/offer
- Refund policy: ${SITE.url}/refund
- Security: ${SITE.url}/security
- Status: ${SITE.url}/status

## Contact
- Email: ${SITE.email}
- Support: ${SITE.supportEmail}
- Telegram: ${SITE.telegram}

## Notes
Prices may change when upstream provider pricing changes. The current price is always shown on /pricing and in the dashboard before payment. CheApi is an independent service and is not affiliated with OpenAI, Anthropic, Z.ai, DeepSeek or Qwen.
`;

  return new Response(body, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
