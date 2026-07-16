import type { Metadata } from "next";

import { getSiteContent } from "@/lib/content/get-site-content";
import ContactPage from "@/pages/ContactPage";

export async function generateMetadata(): Promise<Metadata> {
  const { global } = await getSiteContent();
  const title = "Contact";
  const description = `Request a tour, ask about availability, and contact the ${global.siteName} leasing team in ${global.cityLabel}.`;

  return {
    title,
    description,
    alternates: { canonical: "/contact" },
    openGraph: {
      title: `${title} | ${global.siteName}`,
      description,
      images: ["/images/banner.png"],
    },
  };
}

export default function Page() {
  return <ContactPage />;
}
