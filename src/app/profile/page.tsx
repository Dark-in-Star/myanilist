import type { Metadata } from "next";
import Image from "next/image";
import { AuthRequiredError, getMyUserInfo } from "@/lib/api";
import { LoginPrompt } from "@/components/LoginPrompt";
import { formatCompactNumber, formatDate } from "@/lib/format";
import { logoutAction } from "@/lib/authActions";

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
    if (error instanceof AuthRequiredError) {
      return <LoginPrompt description="Log in to see your MyAnimeList profile and stats." returnTo="/profile" />;
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
        <div className="flex flex-1 flex-col gap-1">
          <h1 className="text-xl font-bold sm:text-2xl">{user.name}</h1>
          <p className="text-sm text-muted">
            {user.location ? `${user.location} · ` : ""}
            {user.joined_at ? `Joined ${formatDate(user.joined_at)}` : ""}
          </p>
        </div>
        <form action={logoutAction}>
          <button
            type="submit"
            className="rounded-full border border-border/60 px-4 py-2 text-sm font-semibold text-muted transition-colors hover:border-danger hover:text-danger"
          >
            Log out
          </button>
        </form>
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
