import type { Metadata } from "next";
import { Bodoni_Moda, Manrope } from "next/font/google";
import type { ReactNode } from "react";
import "./globals.css";

const display = Bodoni_Moda({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--font-display",
  display: "swap",
});

const sans = Manrope({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://helix-research-flax.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Helix | Research you can inspect",
    template: "%s | Helix",
  },
  description:
    "Turn a difficult question into an evidence-backed brief with a visible search path, linked sources and stated gaps.",
  alternates: { canonical: "/" },
  icons: { icon: "/icon.svg" },
  openGraph: {
    title: "Helix | Research you can inspect",
    description:
      "Evidence-backed briefs with a visible search path, linked sources and stated gaps.",
    url: "/",
    siteName: "Helix",
    type: "website",
    images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Helix | Research you can inspect",
    description: "Evidence-backed briefs with a visible research trail.",
    images: ["/opengraph-image"],
  },
  formatDetection: { telephone: false },
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${display.variable} ${sans.variable}`}>{children}</body>
    </html>
  );
}
