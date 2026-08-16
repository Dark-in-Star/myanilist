import { redirect } from "next/navigation";

export default async function MyMangaListPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const params = await searchParams;
  const query = new URLSearchParams({ media: "manga", ...(params.status ? { status: params.status } : {}) });
  redirect(`/mylist?${query.toString()}`);
}
