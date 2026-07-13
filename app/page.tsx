import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Home",
};

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-6 text-center">
      <span className="rounded-full border border-border bg-card px-4 py-1.5 text-sm font-medium text-muted-foreground shadow-soft">
        Next.js App Router · Tailwind v3
      </span>
      <h1 className="font-display text-5xl font-bold tracking-tight text-primary sm:text-6xl">
        Baba Flats
      </h1>
      <p className="max-w-xl text-lg text-muted-foreground">
        The Next.js app is scaffolded and sharing the existing design tokens. This heading uses{" "}
        <code className="text-accent">text-primary</code> on{" "}
        <code className="text-accent">bg-background</code> to prove theme parity with the Vite app.
      </p>
    </main>
  );
}
