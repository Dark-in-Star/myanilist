"use client";

import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function RankingTabs<T extends string>({
  basePath,
  tabs,
  active,
  extraParams,
}: {
  basePath: string;
  tabs: { value: T; label: string }[];
  active: T;
  extraParams?: Record<string, string>;
}) {
  const router = useRouter();

  function handleChange(value: string) {
    const params = new URLSearchParams({ ...extraParams, type: value });
    router.push(`${basePath}?${params.toString()}`);
  }

  return (
    <Select value={active} onValueChange={handleChange}>
      <SelectTrigger aria-label="Ranking" className="w-fit min-w-40">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {tabs.map((tab) => (
          <SelectItem key={tab.value} value={tab.value}>
            {tab.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
