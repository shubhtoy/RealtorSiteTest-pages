import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function resolveAppHref(href: string) {
  // Next.js serves the app at the root and handles routing/basePath itself, so
  // links resolve unchanged. (The Vite-only `import.meta.env.BASE_URL` prefixing
  // is not used on the Next surface and would break SSR / Next routing.)
  return href
}
