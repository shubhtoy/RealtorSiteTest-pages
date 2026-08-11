import type { Metadata } from "next";

import { getSiteContent } from "@/lib/content/get-site-content";
import HomePage from "@/views/HomePage";

export async function generateMetadata(): Promise<Metadata> {
  const { global } = await getSiteContent();
  const title = `${global.siteName} ${global.seoTitleSuffix}`.trim();
  const description = global.description;

  return {
    title: { absolute: title },
    description,
    alternates: { canonical: "/" },
    openGraph: {
      title,
      description,
      images: ["/images/banner.png"],
    },
  };
}

export default function Page() {
  return <HomePage />;
}
