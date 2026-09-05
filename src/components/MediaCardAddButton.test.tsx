import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { MediaCardAddButton } from "./MediaCardAddButton";

const getAnimeListEntryAction = vi.hoisted(() => vi.fn());

vi.mock("@/lib/listEntryActions", () => ({
  getAnimeListEntryAction,
  getMangaListEntryAction: vi.fn(),
}));

function button() {
  return screen.getByTestId("media-card-add-1");
}

describe("MediaCardAddButton", () => {
  it("offers an add affordance when the title isn't tracked", () => {
    render(<MediaCardAddButton id={1} title="Frieren" media="anime" />);
    expect(button()).toHaveAttribute("data-added", "false");
    expect(button()).toHaveAccessibleName(/add Frieren to your list/i);
  });

  it("distinguishes a tracked title and names its status", () => {
    render(<MediaCardAddButton id={1} title="Frieren" media="anime" listStatus="completed" />);
    expect(button()).toHaveAttribute("data-added", "true");
    expect(button()).toHaveAttribute("data-status", "completed");
    expect(button()).toHaveAccessibleName(/completed/i);
  });

  it("gives each list status its own marker rather than a shared one", () => {
    const statuses = ["watching", "completed", "on_hold", "dropped", "plan_to_watch"] as const;

    const classes = statuses.map((status) => {
      const { unmount } = render(
        <MediaCardAddButton id={1} title="Frieren" media="anime" listStatus={status} />,
      );
      const className = button().className;
      unmount();
      return className;
    });

    expect(new Set(classes).size).toBe(statuses.length);
  });

  it("opens the editor with the entry's real progress and score, not zeroes", async () => {
    getAnimeListEntryAction.mockResolvedValue({
      node: { id: 1, title: "Bleach", num_episodes: 13 },
      listStatus: { status: "watching", score: 8, num_episodes_watched: 5 },
    });

    render(<MediaCardAddButton id={1} title="Bleach" media="anime" listStatus="watching" />);
    await userEvent.click(button());

    await waitFor(() => expect(screen.getByText("Edit your list entry")).toBeInTheDocument());

    // The fetched values must drive the modal — the bug was opening at 0 progress / no
    // score / "? ep" even for a title the user was part-way through.
    expect(getAnimeListEntryAction).toHaveBeenCalledWith(1);
    expect(screen.getByLabelText("Episode 5")).toHaveClass("border-accent");
    expect(screen.getByLabelText("Episode 0")).not.toHaveClass("border-accent");
    expect(screen.getByText("13 ep")).toBeInTheDocument();
  });
});
