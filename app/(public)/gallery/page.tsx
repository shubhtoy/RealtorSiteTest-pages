import type { Metadata } from "next";

import { getSiteContent } from "@/lib/content/get-site-content";
import GalleryPage from "@/pages/GalleryPage";

export async function generateMetadata(): Promise<Metadata> {
  const { global } = await getSiteContent();
  const title = "Gallery";
  const description = `Explore interior, exterior, amenity, and floor plan photos from ${global.siteName} apartments in ${global.cityLabel}.`;

  return {
    title,
    description,
    alternates: { canonical: "/gallery" },
    openGraph: {
      title: `${title} | ${global.siteName}`,
      description,
      images: ["/images/banner.png"],
    },
  };
}

export default function Page() {
  return <GalleryPage />;
}
