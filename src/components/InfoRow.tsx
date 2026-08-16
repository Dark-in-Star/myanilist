import type { ReactNode } from "react";

export function InfoRow({ label, icon, children }: { label: string; icon?: ReactNode; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 py-2 text-sm">
      <dt className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted">
        {icon}
        {label}
      </dt>
      <dd className="text-foreground">{children}</dd>
    </div>
  );
}
