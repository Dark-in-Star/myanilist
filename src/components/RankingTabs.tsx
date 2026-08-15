import Link from "next/link";
import clsx from "clsx";

export function RankingTabs<T extends string>({
  basePath,
  tabs,
  active,
}: {
  basePath: string;
  tabs: { value: T; label: string }[];
  active: T;
}) {
  return (
    <div className="no-scrollbar -mx-3 flex gap-2 overflow-x-auto px-3 pb-1 sm:mx-0 sm:px-0 sm:flex-wrap">
      {tabs.map((tab) => (
        <Link
          key={tab.value}
          href={`${basePath}?type=${tab.value}`}
          className={clsx(
            "shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-all duration-200",
            tab.value === active
              ? "border-accent bg-accent text-accent-foreground shadow-sm shadow-accent/30"
              : "border-border/60 bg-surface text-muted hover:-translate-y-0.5 hover:border-accent hover:text-accent",
          )}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  );
}
