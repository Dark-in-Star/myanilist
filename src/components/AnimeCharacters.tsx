import { formatCharacterRole } from "@/lib/format";
import type { AnimeCharacter } from "@/lib/types";
import { PersonAvatar } from "./PersonAvatar";
import { MediaRow, MediaRowItem } from "./MediaRow";

export function AnimeCharacters({ characters }: { characters: AnimeCharacter[] }) {
  if (characters.length === 0) return null;

  return (
    <MediaRow title="Characters">
      {characters.map((character) => {
        const voiceActor = character.voiceActors[0];
        return (
          <MediaRowItem key={character.id}>
            <div className="flex h-full flex-col items-center gap-3 rounded-xl border border-border bg-surface p-3 text-center">
              <PersonAvatar src={character.imageUrl} alt={character.name} size="lg" />
              <div className="flex flex-col gap-0.5">
                <p className="line-clamp-2 text-sm font-semibold text-foreground">{character.name}</p>
                <p className="text-xs text-muted">{formatCharacterRole(character.role)}</p>
              </div>

              {voiceActor && (
                <div className="flex flex-col items-center gap-2 border-t border-border pt-3">
                  <PersonAvatar src={voiceActor.imageUrl} alt={voiceActor.name} size="lg" />
                  <div className="flex flex-col gap-0.5">
                    <p className="line-clamp-2 text-sm font-medium text-foreground">{voiceActor.name}</p>
                    <p className="text-xs text-muted">Japanese</p>
                  </div>
                </div>
              )}
            </div>
          </MediaRowItem>
        );
      })}
    </MediaRow>
  );
}
