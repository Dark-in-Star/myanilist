import { describe, expect, it } from "vitest";
import {
  accumulateSuggestions,
  findNewRelations,
  mergeSuggestions,
  normalizeRelationType,
  selectScannableEntries,
  BROAD_RELATION_TYPES,
  STRICT_RELATION_TYPES,
} from "./sequels";
import type { AnimeNode, ListNode, MyListStatus } from "./types";

function anime(id: number, title: string, related: AnimeNode["related_anime"] = []): AnimeNode {
  return { id, title, related_anime: related } as AnimeNode;
}

function relation(id: number, title: string, type: string) {
  return { node: anime(id, title), relation_type: type, relation_type_formatted: type };
}

function entry(id: number, status?: string): ListNode<AnimeNode, MyListStatus> {
  return {
    node: anime(id, `Anime ${id}`),
    list_status: { status, score: 0 },
  } as ListNode<AnimeNode, MyListStatus>;
}

describe("normalizeRelationType", () => {
  it("normalizes MAL's spacing and casing variants", () => {
    expect(normalizeRelationType("Side story")).toBe("side_story");
    expect(normalizeRelationType("spin-off")).toBe("spin_off");
    expect(normalizeRelationType("SEQUEL")).toBe("sequel");
  });
});

describe("selectScannableEntries", () => {
  it("keeps completed, watching and plan_to_watch, drops the rest", () => {
    const entries = [
      entry(1, "completed"),
      entry(2, "watching"),
      entry(3, "plan_to_watch"),
      entry(4, "dropped"),
      entry(5, undefined),
    ];
    expect(selectScannableEntries(entries).map((e) => e.node.id)).toEqual([1, 2, 3]);
  });

  it("still drops dropped and on-hold entries", () => {
    const entries = [entry(1, "dropped"), entry(2, "on_hold")];
    expect(selectScannableEntries(entries)).toHaveLength(0);
  });
});

describe("findNewRelations", () => {
  it("returns sequels that are not already on the list", () => {
    const source = anime(1, "Show", [relation(2, "Show 2", "sequel"), relation(3, "Show 3", "sequel")]);
    const found = findNewRelations(source, new Set([3]), STRICT_RELATION_TYPES);
    expect(found.map((f) => f.node.id)).toEqual([2]);
  });

  it("excludes side stories in strict mode but includes them in broad mode", () => {
    const source = anime(1, "Show", [relation(2, "Side", "side_story")]);
    expect(findNewRelations(source, new Set(), STRICT_RELATION_TYPES)).toHaveLength(0);
    expect(findNewRelations(source, new Set(), BROAD_RELATION_TYPES)).toHaveLength(1);
  });

  it("never suggests summaries or alternative versions, even in broad mode", () => {
    const source = anime(1, "Show", [
      relation(2, "Recap", "summary"),
      relation(3, "Reboot", "alternative_version"),
    ]);
    expect(findNewRelations(source, new Set(), BROAD_RELATION_TYPES)).toHaveLength(0);
  });

  it("handles an anime with no relations", () => {
    expect(findNewRelations(anime(1, "Show"), new Set(), STRICT_RELATION_TYPES)).toEqual([]);
  });
});

describe("mergeSuggestions", () => {
  it("dedupes a sequel reached from several sources and records each one", () => {
    const s1 = anime(1, "Season 1");
    const s2 = anime(2, "Season 2");
    const target = { node: anime(3, "Season 3"), relationType: "sequel", relationLabel: "Sequel" };

    const merged = mergeSuggestions([
      { source: s1, found: [target] },
      { source: s2, found: [target] },
    ]);

    expect(merged).toHaveLength(1);
    expect(merged[0].sources.map((s) => s.id)).toEqual([1, 2]);
  });

  it("ranks the most-referenced suggestion first", () => {
    const a = anime(1, "A");
    const b = anime(2, "B");
    const popular = { node: anime(10, "Popular"), relationType: "sequel", relationLabel: "Sequel" };
    const lonely = { node: anime(11, "Lonely"), relationType: "sequel", relationLabel: "Sequel" };

    const merged = mergeSuggestions([
      { source: a, found: [popular, lonely] },
      { source: b, found: [popular] },
    ]);

    expect(merged.map((m) => m.node.id)).toEqual([10, 11]);
  });

  it("does not double-count the same source listing a relation twice", () => {
    const a = anime(1, "A");
    const target = { node: anime(9, "T"), relationType: "sequel", relationLabel: "Sequel" };
    const merged = mergeSuggestions([{ source: a, found: [target, target] }]);
    expect(merged[0].sources).toHaveLength(1);
  });
});

describe("accumulateSuggestions", () => {
  const suggestion = (id: number, sources: { id: number; title: string }[]) => ({
    node: anime(id, `Anime ${id}`),
    relationType: "sequel",
    relationLabel: "Sequel",
    sources,
  });

  it("unions sources for the same anime seen in different chunks", () => {
    const first = [suggestion(10, [{ id: 1, title: "A" }])];
    const second = [suggestion(10, [{ id: 2, title: "B" }])];

    const merged = accumulateSuggestions(first, second);
    expect(merged).toHaveLength(1);
    expect(merged[0].sources.map((s) => s.id)).toEqual([1, 2]);
  });

  it("does not duplicate a source already recorded", () => {
    const first = [suggestion(10, [{ id: 1, title: "A" }])];
    const second = [suggestion(10, [{ id: 1, title: "A" }])];
    expect(accumulateSuggestions(first, second)[0].sources).toHaveLength(1);
  });

  it("re-sorts so the most-referenced suggestion leads", () => {
    const previous = [suggestion(10, [{ id: 1, title: "A" }]), suggestion(11, [{ id: 2, title: "B" }])];
    const incoming = [suggestion(11, [{ id: 3, title: "C" }])];
    expect(accumulateSuggestions(previous, incoming).map((m) => m.node.id)).toEqual([11, 10]);
  });

  it("does not mutate the previous array's source lists", () => {
    const previous = [suggestion(10, [{ id: 1, title: "A" }])];
    accumulateSuggestions(previous, [suggestion(10, [{ id: 2, title: "B" }])]);
    expect(previous[0].sources).toHaveLength(1);
  });
});
