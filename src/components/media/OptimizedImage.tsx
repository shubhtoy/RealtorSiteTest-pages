import Image from "next/image";
import type { CSSProperties } from "react";

/**
 * Public API (unchanged) so existing call sites keep working:
 *   src, alt, className, sizes, objectFit?: 'cover' | 'contain',
 *   width?, height?, loading?, priority?, style?
 *
 * Implementation now delegates to `next/image` for responsive AVIF/WebP
 * delivery (via the built-in optimizer + `next.config.ts` `images.formats`),
 * replacing the previous custom `<picture>` + pre-generated variant pipeline.
 *
 * We render `<Image fill>` inside a wrapper element. The wrapper receives the
 * caller's `className` (so sizing utilities like `h-64 w-full` or
 * `absolute inset-0` still apply and reserve layout space), and the image
 * itself gets `object-cover` / `object-contain` per `objectFit`.
 */
type OptimizedImageProps = {
  src: string;
  alt?: string;
  className?: string;
  /** Required by `next/image` when using `fill`. Defaults to full viewport. */
  sizes?: string;
  /** Retained for API compatibility; `fill` derives size from the wrapper. */
  width?: number;
  height?: number;
  loading?: "lazy" | "eager";
  /** Set on the first above-the-fold image to prioritize the LCP. */
  priority?: boolean;
  objectFit?: "cover" | "contain";
  style?: CSSProperties;
};

// Sources the built-in optimizer cannot (or should not) process without extra
// configuration. These are passed through untouched via `unoptimized`.
function isUnoptimizableSrc(src: string): boolean {
  return /^(data:|blob:)/i.test(src) || /^https?:\/\//i.test(src) || src.startsWith("//");
}

// `next/image` with `fill` requires a positioned ancestor. If the caller's
// className already establishes a positioning context we leave it alone;
// otherwise we add `relative` so the fill image is anchored correctly.
const POSITION_RE = /(^|\s)(absolute|fixed|relative|sticky)(\s|$)/;

export function OptimizedImage({
  src,
  alt = "",
  className,
  sizes = "100vw",
  loading = "lazy",
  priority = false,
  objectFit = "cover",
  style,
  // Accepted for backwards compatibility with existing call sites. With `fill`
  // the rendered dimensions come from the wrapper, so these are intentionally
  // not forwarded to <Image>.
  width: _width,
  height: _height,
}: OptimizedImageProps) {
  const objectFitClass = objectFit === "contain" ? "object-contain" : "object-cover";
  const hasPositioning = className ? POSITION_RE.test(className) : false;
  const wrapperClassName = hasPositioning ? className : ["relative", className].filter(Boolean).join(" ");

  return (
    <span className={wrapperClassName} style={{ display: "block", ...style }}>
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        className={objectFitClass}
        unoptimized={isUnoptimizableSrc(src)}
        {...(priority ? { priority: true } : { loading })}
      />
    </span>
  );
}
