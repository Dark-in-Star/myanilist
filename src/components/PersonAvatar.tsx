import Image from "next/image";

export function PersonAvatar({ src, alt }: { src?: string; alt: string }) {
  if (src) {
    return (
      <div className="relative h-16 w-12 shrink-0 overflow-hidden rounded-lg bg-surface-muted">
        <Image src={src} alt={alt} fill sizes="48px" className="object-cover" />
      </div>
    );
  }

  return (
    <div className="relative flex h-16 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-surface-muted">
      <Image src="/logo.webp" alt="" aria-hidden="true" width={28} height={28} className="object-contain opacity-50" />
    </div>
  );
}
