import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Helix — AI Research Assistant",
  description: "AI-powered research agent with visible orchestration, source provenance, and structured synthesis.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {/* Cosmic background layer */}
        <div className="cosmic-bg" aria-hidden="true" />

        {/* App content */}
        <div className="relative z-10 h-screen overflow-hidden">
          {children}
        </div>
      </body>
    </html>
  );
}
