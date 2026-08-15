"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const ROTATE_INTERVAL_MS = 10_000;

export function HeroBackdrop({ images }: { images: string[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (images.length < 2) return;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % images.length);
    }, ROTATE_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [images.length]);

  if (images.length === 0) return null;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl">
      {images.map((src, i) => (
        <div
          key={src}
          className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
          style={{ opacity: i === index ? 1 : 0 }}
        >
          {/* Blurred, zoomed fill so a portrait cover never leaves empty bars beside it. */}
          <Image
            src={src}
            alt=""
            aria-hidden="true"
            fill
            sizes="100vw"
            priority={i === 0}
            className="scale-125 object-cover blur-2xl"
          />
          {/* The same image again, sharp and fully visible on top. */}
          <Image src={src} alt="" aria-hidden="true" fill sizes="100vw" priority={i === 0} className="object-contain" />
        </div>
      ))}
      <div className="absolute inset-0 bg-black/45" />
    </div>
  );
}
