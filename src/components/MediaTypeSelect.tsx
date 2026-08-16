"use client";

import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const MEDIA_OPTIONS = [
  { value: "anime", label: "Anime" },
  { value: "manga", label: "Manga" },
] as const;

export function MediaTypeSelect({
  active,
  extraParams,
}: {
  active: "anime" | "manga";
  extraParams?: Record<string, string>;
}) {
  const router = useRouter();

  function handleChange(value: string) {
    const params = new URLSearchParams({ ...extraParams, media: value });
    router.push(`/browse?${params.toString()}`);
  }

  return (
    <Select value={active} onValueChange={handleChange}>
      <SelectTrigger aria-label="Media" className="w-fit min-w-32">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {MEDIA_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
