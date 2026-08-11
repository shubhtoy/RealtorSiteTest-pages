import { getSiteContent } from "@/lib/content/get-site-content";
import { EditableContentProvider } from "@/context/EditableContentContext";
import SiteHeader from "@/components/layout/SiteHeader";
import SiteFooter from "@/components/layout/SiteFooter";
import WelcomeGate from "@/components/layout/WelcomeGate";
import { LocalBusinessJsonLd } from "@/components/seo/LocalBusinessJsonLd";

/**
 * Server layout for the public site.
 *
 * Reads the server-authoritative content document at request/build time and
 * seeds the (client) content provider with it, so the header, footer, and page
 * render identically on the server and the client's first paint. The provider's
 * client-side content.json fetch and localStorage reads are skipped while seeded.
 */
export default async function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const content = await getSiteContent();

  return (
    <EditableContentProvider initialContent={content}>
      <LocalBusinessJsonLd />
      <SiteHeader />
      <main id="main-content">{children}</main>
      <SiteFooter />
      <WelcomeGate />
    </EditableContentProvider>
  );
}
