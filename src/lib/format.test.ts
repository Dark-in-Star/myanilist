import { describe, expect, it } from "vitest";
import {
  formatAnimeStatus,
  formatCompactNumber,
  formatDate,
  formatDateRange,
  formatMangaStatus,
  formatMediaType,
  formatScore,
  formatSeasonLabel,
  getCurrentAnimeSeason,
  isAnimeSeason,
  shiftSeason,
} from "./format";

describe("formatScore", () => {
  it("formats a mean score to two decimal places", () => {
    expect(formatScore(8.567)).toBe("8.57");
  });

  it("returns N/A when the score is undefined", () => {
    expect(formatScore(undefined)).toBe("N/A");
  });

  it("formats a zero score as 0.00, not N/A", () => {
    expect(formatScore(0)).toBe("0.00");
  });
});

describe("formatCompactNumber", () => {
  it("compacts large numbers", () => {
    expect(formatCompactNumber(1500000)).toBe("1.5M");
  });

  it("returns N/A when undefined", () => {
    expect(formatCompactNumber(undefined)).toBe("N/A");
  });
});

describe("formatDate", () => {
  it("returns 'Unknown' for an undefined date", () => {
    expect(formatDate(undefined)).toBe("Unknown");
  });

  it("formats a full yyyy-mm-dd date", () => {
    expect(formatDate("2023-09-29")).toBe("Sep 29, 2023");
  });

  it("formats a year-only date without a day suffix", () => {
    expect(formatDate("2023")).toBe("Jan 2023");
  });

  it("formats a full ISO datetime (e.g. joined_at) instead of returning it raw", () => {
    expect(formatDate("2021-07-16T15:17:24+00:00")).toBe("Jul 16, 2021");
  });
});

describe("formatDateRange", () => {
  it("returns 'Unknown' when both dates are missing", () => {
    expect(formatDateRange(undefined, undefined)).toBe("Unknown");
  });

  it("shows a '?' end when only a start date is known", () => {
    expect(formatDateRange("2023-09-29", undefined)).toBe("Sep 29, 2023 - ?");
  });

  it("joins both dates when present", () => {
    expect(formatDateRange("2023-09-29", "2024-03-22")).toBe("Sep 29, 2023 - Mar 22, 2024");
  });
});

describe("formatAnimeStatus", () => {
  it("maps known statuses to display labels", () => {
    expect(formatAnimeStatus("currently_airing")).toBe("Currently Airing");
  });

  it("falls back to 'Unknown' when missing", () => {
    expect(formatAnimeStatus(undefined)).toBe("Unknown");
  });
});

describe("formatMangaStatus", () => {
  it("maps known statuses to display labels", () => {
    expect(formatMangaStatus("currently_publishing")).toBe("Publishing");
  });

  it("falls back to 'Unknown' when missing", () => {
    expect(formatMangaStatus(undefined)).toBe("Unknown");
  });
});

describe("formatMediaType", () => {
  it("uppercases and strips underscores", () => {
    expect(formatMediaType("tv_special")).toBe("TV SPECIAL");
  });

  it("falls back to 'Unknown' when missing", () => {
    expect(formatMediaType(undefined)).toBe("Unknown");
  });
});

describe("formatSeasonLabel", () => {
  it("capitalizes each season", () => {
    expect(formatSeasonLabel("winter")).toBe("Winter");
    expect(formatSeasonLabel("fall")).toBe("Fall");
  });
});

describe("isAnimeSeason", () => {
  it("accepts the four valid seasons", () => {
    expect(isAnimeSeason("winter")).toBe(true);
    expect(isAnimeSeason("spring")).toBe(true);
    expect(isAnimeSeason("summer")).toBe(true);
    expect(isAnimeSeason("fall")).toBe(true);
  });

  it("rejects anything else", () => {
    expect(isAnimeSeason("autumn")).toBe(false);
    expect(isAnimeSeason(undefined)).toBe(false);
  });
});

describe("getCurrentAnimeSeason", () => {
  it("maps January-March to winter", () => {
    expect(getCurrentAnimeSeason(new Date(2026, 1, 15))).toEqual({ year: 2026, season: "winter" });
  });

  it("maps April-June to spring", () => {
    expect(getCurrentAnimeSeason(new Date(2026, 4, 15))).toEqual({ year: 2026, season: "spring" });
  });

  it("maps July-September to summer", () => {
    expect(getCurrentAnimeSeason(new Date(2026, 7, 15))).toEqual({ year: 2026, season: "summer" });
  });

  it("maps October-December to fall", () => {
    expect(getCurrentAnimeSeason(new Date(2026, 10, 15))).toEqual({ year: 2026, season: "fall" });
  });
});

describe("shiftSeason", () => {
  it("moves forward within the same year", () => {
    expect(shiftSeason(2026, "winter", 1)).toEqual({ year: 2026, season: "spring" });
  });

  it("moves backward within the same year", () => {
    expect(shiftSeason(2026, "summer", -1)).toEqual({ year: 2026, season: "spring" });
  });

  it("rolls over into the next year after fall", () => {
    expect(shiftSeason(2026, "fall", 1)).toEqual({ year: 2027, season: "winter" });
  });

  it("rolls back into the previous year before winter", () => {
    expect(shiftSeason(2026, "winter", -1)).toEqual({ year: 2025, season: "fall" });
  });
});
