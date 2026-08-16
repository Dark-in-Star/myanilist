import { redirect } from "next/navigation";

export default async function AnimePage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const params = await searchParams;
  const query = new URLSearchParams({ media: "anime", ...(params.type ? { type: params.type } : {}) });
  redirect(`/browse?${query.toString()}`);
}
