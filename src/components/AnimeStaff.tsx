import type { AnimeStaffMember } from "@/lib/types";
import { PersonAvatar } from "./PersonAvatar";
import { MediaRow, MediaRowItem } from "./MediaRow";

export function AnimeStaff({ staff }: { staff: AnimeStaffMember[] }) {
  if (staff.length === 0) return null;

  return (
    <MediaRow title="Staff">
      {staff.map((member) => (
        <MediaRowItem key={`${member.id}-${member.role}`}>
          <div className="flex h-full flex-col items-center gap-3 rounded-xl border border-border bg-surface p-3 text-center">
            <PersonAvatar src={member.imageUrl} alt={member.name} size="lg" />
            <div className="flex flex-col gap-0.5">
              <p className="line-clamp-2 text-sm font-semibold text-foreground">{member.name}</p>
              <p className="line-clamp-2 text-xs text-muted">{member.role}</p>
            </div>
          </div>
        </MediaRowItem>
      ))}
    </MediaRow>
  );
}
