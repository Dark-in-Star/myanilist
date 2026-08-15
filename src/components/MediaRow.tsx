import Link from "next/link";
import type { ReactNode } from "react";

export function MediaRow({
  title,
  viewAllHref,
  children,
}: {
  title: string;
  viewAllHref?: string;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-foreground sm:text-xl">{title}</h2>
        {viewAllHref && (
          <Link href={viewAllHref} className="text-sm font-medium text-accent hover:underline">
            View all →
          </Link>
        )}
      </div>
      <div className="no-scrollbar flex gap-3 overflow-x-auto pb-1 sm:gap-4">{children}</div>
    </section>
  );
}

export function MediaRowItem({ children }: { children: ReactNode }) {
  return <div className="w-[130px] shrink-0 sm:w-[160px] md:w-[180px]">{children}</div>;
}
