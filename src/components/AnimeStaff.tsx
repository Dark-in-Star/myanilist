import type { AnimeStaffMember } from "@/lib/types";
import { PersonAvatar } from "./PersonAvatar";

export function AnimeStaff({ staff }: { staff: AnimeStaffMember[] }) {
  if (staff.length === 0) return null;

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-lg font-bold text-foreground sm:text-xl">Staff</h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {staff.map((member) => (
          <div
            key={`${member.id}-${member.role}`}
            className="flex items-center gap-3 rounded-xl border border-border bg-surface p-3"
          >
            <PersonAvatar src={member.imageUrl} alt={member.name} />
            <div className="flex min-w-0 flex-col gap-0.5">
              <p className="truncate text-sm font-semibold text-foreground">{member.name}</p>
              <p className="truncate text-xs text-muted">{member.role}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
