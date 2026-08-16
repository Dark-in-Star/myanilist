import type { RelatedAnime } from "./types";

// Prequel/sequel/adaptation are the relations users care about navigating first;
// everything else (character cameos, "other") sorts after in whatever order MAL returned.
const RELATION_PRIORITY = [
  "Sequel",
  "Prequel",
  "Adaptation",
  "Alternative Version",
  "Alternative Setting",
  "Side Story",
  "Parent Story",
  "Full Story",
  "Summary",
  "Spin-Off",
  "Character",
  "Other",
];

export function sortRelatedAnime(related: RelatedAnime[] = []): RelatedAnime[] {
  return related.slice().sort((a, b) => {
    const ai = RELATION_PRIORITY.indexOf(a.relation_type_formatted);
    const bi = RELATION_PRIORITY.indexOf(b.relation_type_formatted);
    return (ai === -1 ? RELATION_PRIORITY.length : ai) - (bi === -1 ? RELATION_PRIORITY.length : bi);
  });
}
