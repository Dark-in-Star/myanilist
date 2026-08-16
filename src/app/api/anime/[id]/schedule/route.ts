import { NextResponse } from "next/server";
import { getNextAiringEpisode } from "@/lib/anilist";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const malId = Number(id);
  if (!Number.isInteger(malId) || malId <= 0) {
    return NextResponse.json({ error: "Invalid anime id" }, { status: 400 });
  }

  const schedule = await getNextAiringEpisode(malId);

  return NextResponse.json(
    { schedule },
    { headers: { "Cache-Control": "public, max-age=60, stale-while-revalidate=240" } },
  );
}
