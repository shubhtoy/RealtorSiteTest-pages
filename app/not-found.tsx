import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Page Not Found",
  description: "The page you're looking for doesn't exist.",
};

export default function NotFound() {
  return (
    <main
      id="main-content"
      className="mx-auto flex min-h-[60vh] w-[min(1140px,92vw)] flex-col items-center justify-center gap-4 overflow-hidden py-24 text-center"
    >
      <h1 className="font-display text-4xl tracking-tight text-foreground md:text-5xl">
        Page Not Found
      </h1>
      <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link
        href="/"
        className="mt-2 inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-primary-foreground shadow-soft transition hover:-translate-y-0.5 hover:shadow-soft-lg"
      >
        Back to Home
      </Link>
    </main>
  );
}
