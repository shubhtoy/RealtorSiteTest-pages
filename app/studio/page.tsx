import type { Metadata } from "next";

import StudioClient from "./StudioClient";

// The Studio is an admin-only editor: keep it out of search indexes.
export const metadata: Metadata = {
  title: "Studio",
  robots: { index: false, follow: false },
};

export default function StudioRoute() {
  return <StudioClient />;
}
