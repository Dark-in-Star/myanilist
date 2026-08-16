import Image from "next/image";

const SIZES = {
  sm: { box: "h-16 w-12", sizes: "48px", logo: 28 },
  lg: { box: "h-24 w-20", sizes: "80px", logo: 36 },
};

export function PersonAvatar({ src, alt, size = "sm" }: { src?: string; alt: string; size?: keyof typeof SIZES }) {
  const { box, sizes, logo } = SIZES[size];

  if (src) {
    return (
      <div className={`relative ${box} shrink-0 overflow-hidden rounded-lg bg-surface-muted`}>
        <Image src={src} alt={alt} fill sizes={sizes} className="object-cover" />
      </div>
    );
  }

  return (
    <div className={`relative flex ${box} shrink-0 items-center justify-center overflow-hidden rounded-lg bg-surface-muted`}>
      <Image src="/logo.webp" alt="" aria-hidden="true" width={logo} height={logo} className="object-contain opacity-50" />
    </div>
  );
}
