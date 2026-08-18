"use client";

import { useSearchParams } from "next/navigation";
import { MediaTypeToggle } from "./MediaTypeToggle";

export function MobileMediaToggle() {
  const searchParams = useSearchParams();
  const active = searchParams.get("media") === "manga" ? "manga" : "anime";

  return <MediaTypeToggle active={active} />;
}
