import { redirect } from "next/navigation";

export default async function MyAnimeListPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const params = await searchParams;
  const query = new URLSearchParams({ media: "anime", ...(params.status ? { status: params.status } : {}) });
  redirect(`/mylist?${query.toString()}`);
}
