import { formatCharacterRole } from "@/lib/format";
import type { AnimeCharacter } from "@/lib/types";
import { PersonAvatar } from "./PersonAvatar";

export function AnimeCharacters({ characters }: { characters: AnimeCharacter[] }) {
  if (characters.length === 0) return null;

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-lg font-bold text-foreground sm:text-xl">Characters</h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {characters.map((character) => {
          const voiceActor = character.voiceActors[0];
          return (
            <div
              key={character.id}
              className="flex items-center gap-3 rounded-xl border border-border bg-surface p-3"
            >
              <PersonAvatar src={character.imageUrl} alt={character.name} />
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <p className="truncate text-sm font-semibold text-foreground">{character.name}</p>
                <p className="text-xs text-muted">{formatCharacterRole(character.role)}</p>
              </div>

              {voiceActor && (
                <>
                  <div className="flex min-w-0 flex-1 flex-col items-end gap-0.5 text-right">
                    <p className="truncate text-sm font-medium text-foreground">{voiceActor.name}</p>
                    <p className="text-xs text-muted">Japanese</p>
                  </div>
                  <PersonAvatar src={voiceActor.imageUrl} alt={voiceActor.name} />
                </>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
