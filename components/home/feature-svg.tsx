/**
 * Feature SVGs are drawn as transparent images. Embedding them as documents
 * (`object`) can give each one a white plugin canvas, which is especially
 * visible against the feature cards. The SVGs are self-contained and retain
 * their transparent canvas when loaded this way.
 */
export function FeatureSvg({
  src,
  alt,
  width,
  height,
  className,
  decorative = false,
}: {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  decorative?: boolean;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={decorative ? "" : alt}
      width={width}
      height={height}
      className={className}
      aria-hidden={decorative || undefined}
    />
  );
}
