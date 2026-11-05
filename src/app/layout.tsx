import type { Metadata, Viewport } from "next";
import { Onest, JetBrains_Mono } from "next/font/google";
import { SITE } from "@/lib/site";
import "./globals.css";

const onest = Onest({
  variable: "--font-onest",
  subsets: ["cyrillic", "latin"],
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["cyrillic", "latin"],
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: "CheApi — API для GPT, Claude, GLM и DeepSeek",
    template: "%s — CheApi",
  },
  description: SITE.description,
  applicationName: SITE.name,
  keywords: [
    "API GPT",
    "API Claude",
    "API DeepSeek",
    "API GLM",
    "OpenAI API",
    "Anthropic API",
    "Codex CLI",
    "Claude Code",
    "AI API Россия",
    "оплата токенов рублями",
    "неофициальный API",
    "CheApi",
  ],
  authors: [{ name: SITE.name, url: SITE.url }],
  creator: SITE.name,
  publisher: SITE.name,
  category: "technology",
  openGraph: {
    type: "website",
    locale: "ru_RU",
    url: "/",
    siteName: SITE.name,
    title: "CheApi — все AI-модели по одному ключу",
    description: SITE.shortDescription,
  },
  twitter: {
    card: "summary_large_image",
    title: "CheApi — все AI-модели по одному ключу",
    description: SITE.shortDescription,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  formatDetection: { email: false, address: false, telephone: false },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
    yandex: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION,
  },
  other: {
    "ai-content-declaration": "human-authored marketing content, reviewed",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f7f4ec",
  colorScheme: "light",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ru"
      className={`${onest.variable} ${jetbrains.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-cream text-ink">{children}</body>
    </html>
  );
}
