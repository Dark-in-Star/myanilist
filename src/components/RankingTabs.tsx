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
}: {
  basePath: string;
  tabs: { value: T; label: string }[];
  active: T;
}) {
  const router = useRouter();

  return (
    <Select
      value={active}
      onValueChange={(value) => router.push(`${basePath}?type=${value}`)}
    >
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
