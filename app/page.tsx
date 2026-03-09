"use client";

import { QueryComposer } from "@/components/QueryComposer";

export default function Home() {
  return (
    <main className="flex h-full items-start justify-center overflow-y-auto px-3 py-5 sm:px-6 sm:py-6">
      <QueryComposer />
    </main>
  );
}
