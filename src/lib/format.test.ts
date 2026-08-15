import { describe, expect, it } from "vitest";
import {
  formatAnimeStatus,
  formatCompactNumber,
  formatDate,
  formatDateRange,
  formatMangaStatus,
  formatMediaType,
  formatScore,
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
