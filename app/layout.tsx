import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

// Load Plus Jakarta Sans via next/font (self-hosted, no render-blocking
// remote @import). Exposes the `--font-body` CSS variable; `--font-display`
// is mapped to the same family in globals.css so Tailwind's `font-sans` and
// `font-display` both resolve to Plus Jakarta Sans.
const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
  variable: "--font-body",
});

// Public base URL of the deployed site, used to resolve absolute URLs for
// canonical links and Open Graph image paths across all routes.
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://babaflats.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Baba Flats",
    template: "%s | Baba Flats",
  },
  description:
    "Modern apartment living at Baba Flats — thoughtfully designed 1BR, 2BR, and 3BR homes with premium amenities at 1204 Veterans Memorial Hwy SW, Mableton, GA 30126. Call (770) 726-8907.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={jakarta.variable}>
      <body className="min-h-screen bg-background font-sans text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}
