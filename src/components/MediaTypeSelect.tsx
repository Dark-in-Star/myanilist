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

export function MediaTypeSelect({ active }: { active: "anime" | "manga" }) {
  const router = useRouter();

  return (
    <Select value={active} onValueChange={(value) => router.push(`/browse?media=${value}`)}>
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
