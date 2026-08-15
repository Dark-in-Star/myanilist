import type { Metadata } from "next";
import Image from "next/image";
import { ApiError, BASE_URL, getMyUserInfo } from "@/lib/api";
import { EmptyState } from "@/components/EmptyState";
import { formatCompactNumber, formatDate } from "@/lib/format";

export const metadata: Metadata = { title: "Profile" };

const STAT_ITEMS: { key: keyof NonNullable<Awaited<ReturnType<typeof getMyUserInfo>>["anime_statistics"]>; label: string }[] = [
  { key: "num_items_watching", label: "Watching" },
  { key: "num_items_completed", label: "Completed" },
  { key: "num_items_on_hold", label: "On Hold" },
  { key: "num_items_dropped", label: "Dropped" },
  { key: "num_items_plan_to_watch", label: "Plan to Watch" },
  { key: "num_days", label: "Days Watched" },
];

export default async function ProfilePage() {
  let user;
  try {
    user = await getMyUserInfo();
  } catch (error) {
    if (error instanceof ApiError && (error.status === 401 || error.status === 503)) {
      return (
        <EmptyState
          title="Not connected to MyAnimeList"
          description={`myanilist-server has no access token configured. Visit ${BASE_URL}/auth/login to authenticate, then reload this page.`}
        />
      );
    }
    throw error;
  }

  const stats = user.anime_statistics;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-surface p-6 text-center sm:flex-row sm:text-left">
        <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full bg-surface-muted">
          {user.picture && <Image src={user.picture} alt={user.name} fill sizes="96px" className="object-cover" />}
        </div>
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-bold sm:text-2xl">{user.name}</h1>
          <p className="text-sm text-muted">
            {user.location ? `${user.location} · ` : ""}
            {user.joined_at ? `Joined ${formatDate(user.joined_at)}` : ""}
          </p>
        </div>
      </div>

      {stats && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
          {STAT_ITEMS.map((item) => (
            <div key={item.key} className="flex flex-col items-center gap-1 rounded-xl border border-border bg-surface py-4">
              <span className="text-lg font-bold text-accent sm:text-xl">
                {formatCompactNumber(stats[item.key] as number)}
              </span>
              <span className="text-xs text-muted">{item.label}</span>
            </div>
          ))}
          <div className="flex flex-col items-center gap-1 rounded-xl border border-border bg-surface py-4">
            <span className="text-lg font-bold text-score sm:text-xl">{stats.mean_score.toFixed(2)}</span>
            <span className="text-xs text-muted">Mean Score</span>
          </div>
        </div>
      )}
    </div>
  );
}
