import { redirect } from "next/navigation";

export default async function MangaPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const params = await searchParams;
  const query = new URLSearchParams({ media: "manga", ...(params.type ? { type: params.type } : {}) });
  redirect(`/browse?${query.toString()}`);
}
