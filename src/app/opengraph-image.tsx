import { ImageResponse } from "next/og";

export const alt =
  "CheApi — все AI-модели по одному ключу. GPT, Claude, GLM и DeepSeek через OpenAI-совместимый API.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "#f7f4ec",
          padding: "58px 64px 52px",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            right: -120,
            top: -160,
            width: 520,
            height: 520,
            borderRadius: 999,
            background: "rgba(216,255,106,0.55)",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: -140,
            bottom: -200,
            width: 460,
            height: 460,
            borderRadius: 999,
            background: "rgba(191,227,255,0.55)",
          }}
        />

        <div style={{ display: "flex", alignItems: "center", gap: 16, position: "relative" }}>
          <div
            style={{
              width: 62,
              height: 62,
              borderRadius: 17,
              background: "#0b1f16",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#d8ff6a",
              fontSize: 30,
              fontWeight: 700,
              letterSpacing: "-2px",
            }}
          >
            »
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 38,
              fontWeight: 700,
              letterSpacing: "-0.04em",
              color: "#0b1f16",
            }}
          >
            che
            <span style={{ color: "#067a45" }}>api</span>
          </div>
          <div
            style={{
              display: "flex",
              marginLeft: "auto",
              border: "1px solid #e4dfd2",
              background: "rgba(255,255,255,0.7)",
              borderRadius: 999,
              padding: "10px 20px",
              fontSize: 19,
              fontWeight: 600,
              color: "#2c4137",
            }}
          >
            cheapi.ru
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flex: 1,
            alignItems: "center",
            justifyContent: "space-between",
            gap: 56,
            position: "relative",
            marginTop: 20,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", maxWidth: 640 }}>
            <div
              style={{
                display: "flex",
                fontSize: 21,
                fontWeight: 700,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: "#067a45",
              }}
            >
              API для AI-моделей
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                marginTop: 18,
                fontSize: 82,
                fontWeight: 800,
                lineHeight: 0.98,
                letterSpacing: "-0.055em",
                color: "#0b1f16",
              }}
            >
              <span>Все модели.</span>
              <span style={{ color: "#067a45" }}>Один ключ.</span>
            </div>
            <div
              style={{
                display: "flex",
                marginTop: 24,
                fontSize: 26,
                lineHeight: 1.4,
                color: "#61736a",
                maxWidth: 560,
              }}
            >
              GPT, Claude, GLM и DeepSeek через OpenAI-совместимый API. Оплата в рублях, без подписки.
            </div>
          </div>

          <div
            style={{
              width: 392,
              display: "flex",
              flexDirection: "column",
              background: "#0b1f16",
              borderRadius: 26,
              padding: "24px 26px",
              color: "#d7e5dc",
              boxShadow: "0 30px 60px -30px rgba(11,31,22,0.55)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 18 }}>
              <span style={{ width: 9, height: 9, borderRadius: 99, background: "#ff6b5e" }} />
              <span style={{ width: 9, height: 9, borderRadius: 99, background: "#ffc94a" }} />
              <span style={{ width: 9, height: 9, borderRadius: 99, background: "#3ddc84" }} />
              <span
                style={{
                  marginLeft: 10,
                  fontSize: 13,
                  letterSpacing: "0.14em",
                  color: "rgba(255,255,255,0.3)",
                }}
              >
                QUICKSTART
              </span>
            </div>
            <div style={{ display: "flex", fontSize: 17, fontFamily: "monospace", lineHeight: 1.75 }}>
              <span style={{ color: "#d8ff6a" }}>export&nbsp;</span>
              <span>OPENAI_BASE_URL=</span>
            </div>
            <div style={{ display: "flex", fontSize: 17, fontFamily: "monospace", color: "#ffb88a" }}>
              https://cheapi.ru/v1
            </div>
            <div style={{ display: "flex", fontSize: 17, fontFamily: "monospace", marginTop: 10 }}>
              <span style={{ color: "#d8ff6a" }}>export&nbsp;</span>
              <span>OPENAI_API_KEY=</span>
            </div>
            <div style={{ display: "flex", fontSize: 17, fontFamily: "monospace", color: "#bfe3ff" }}>
              che_sk_••••••••
            </div>
            <div
              style={{
                display: "flex",
                marginTop: 18,
                paddingTop: 16,
                borderTop: "1px solid rgba(255,255,255,0.12)",
                fontSize: 17,
                color: "rgba(255,255,255,0.55)",
              }}
            >
              OpenAI · Anthropic · Streaming
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 14, position: "relative" }}>
          {[
            ["34", "модели в каталоге"],
            ["11,42 ₽", "за 1 млн токенов"],
            ["0 ₽", "за неактивность"],
          ].map(([value, label]) => (
            <div
              key={label}
              style={{
                display: "flex",
                flexDirection: "column",
                flex: 1,
                border: "1px solid #e4dfd2",
                background: "rgba(255,255,255,0.75)",
                borderRadius: 18,
                padding: "16px 20px",
              }}
            >
              <span style={{ fontSize: 26, fontWeight: 700, color: "#0b1f16", letterSpacing: "-0.02em" }}>
                {value}
              </span>
              <span style={{ fontSize: 16, color: "#61736a", marginTop: 2 }}>{label}</span>
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size },
  );
}
