import type { Metadata } from "next";
import "./globals.css";

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
    "Modern apartment living at Baba Flats — thoughtfully designed homes with premium amenities.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background font-sans text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}
