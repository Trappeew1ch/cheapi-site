import { ImageResponse } from "next/og";
import { getPost, POSTS } from "@/content/blog";

export const dynamic = "force-static";

export function generateStaticParams() {
  return POSTS.map((post) => ({ slug: post.slug }));
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const post = getPost(slug);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "#f7f4ec",
          padding: "54px 64px",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            right: -120,
            top: -180,
            width: 480,
            height: 480,
            borderRadius: 999,
            background: "rgba(216,255,106,0.55)",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: -160,
            bottom: -220,
            width: 500,
            height: 500,
            borderRadius: 999,
            background: "rgba(191,227,255,0.5)",
          }}
        />

        <div style={{ display: "flex", alignItems: "center", gap: 14, position: "relative" }}>
          <div
            style={{
              width: 54,
              height: 54,
              borderRadius: 15,
              background: "#0b1f16",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#d8ff6a",
              fontSize: 28,
              fontWeight: 700,
            }}
          >
            »
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 34,
              fontWeight: 700,
              letterSpacing: "-0.04em",
              color: "#0b1f16",
            }}
          >
            che<span style={{ color: "#067a45" }}>api</span>
          </div>
          <div
            style={{
              display: "flex",
              marginLeft: "auto",
              borderRadius: 999,
              border: "1px solid #e4dfd2",
              background: "rgba(255,255,255,0.75)",
              padding: "9px 18px",
              fontSize: 17,
              fontWeight: 600,
              color: "#067a45",
            }}
          >
            {post?.tag ?? "Блог"}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flex: 1,
            alignItems: "center",
            position: "relative",
            paddingTop: 24,
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: post && post.title.length > 70 ? 58 : 70,
              fontWeight: 800,
              lineHeight: 1.04,
              letterSpacing: "-0.05em",
              color: "#0b1f16",
              maxWidth: 1000,
            }}
          >
            {post?.title ?? "Блог CheApi"}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 18,
            position: "relative",
            borderTop: "1px solid #e4dfd2",
            paddingTop: 22,
            fontSize: 18,
            color: "#61736a",
          }}
        >
          <span>cheapi.ru/blog</span>
          <span style={{ color: "#d3ccbb" }}>·</span>
          <span>{post?.readingTime ?? 8} мин чтения</span>
          <span style={{ color: "#d3ccbb" }}>·</span>
          <span>API для GPT, Claude, GLM и DeepSeek</span>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
