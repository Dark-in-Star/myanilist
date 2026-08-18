import { afterEach, describe, expect, it, vi } from "vitest";
import { detectDeviceTimezone, generateGoogleCalendarUrl } from "./googleCalendar";

const baseEvent = {
  title: "Attack on Titan - Episode 5",
  startDate: "2026-08-20T19:00:00Z",
  endDate: "2026-08-20T19:30:00Z",
};

describe("generateGoogleCalendarUrl", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("builds a TEMPLATE URL with the required parameters", () => {
    const url = new URL(generateGoogleCalendarUrl({ ...baseEvent, timezone: "UTC" }));
    expect(url.origin + url.pathname).toBe("https://calendar.google.com/calendar/render");
    expect(url.searchParams.get("action")).toBe("TEMPLATE");
    expect(url.searchParams.get("text")).toBe(baseEvent.title);
    expect(url.searchParams.get("dates")).toBe("20260820T190000/20260820T193000");
    expect(url.searchParams.get("ctz")).toBe("UTC");
  });

  it("includes description and location only when provided", () => {
    const withExtras = new URL(
      generateGoogleCalendarUrl({
        ...baseEvent,
        description: "New episode airs today.",
        location: "Streaming",
        timezone: "UTC",
      }),
    );
    expect(withExtras.searchParams.get("details")).toBe("New episode airs today.");
    expect(withExtras.searchParams.get("location")).toBe("Streaming");

    const withoutExtras = new URL(generateGoogleCalendarUrl({ ...baseEvent, timezone: "UTC" }));
    expect(withoutExtras.searchParams.has("details")).toBe(false);
    expect(withoutExtras.searchParams.has("location")).toBe(false);
  });

  it("accepts a Date object and an ISO string producing the same result", () => {
    const fromString = generateGoogleCalendarUrl({ ...baseEvent, timezone: "UTC" });
    const fromDate = generateGoogleCalendarUrl({
      ...baseEvent,
      startDate: new Date(baseEvent.startDate),
      endDate: new Date(baseEvent.endDate),
      timezone: "UTC",
    });
    expect(fromDate).toBe(fromString);
  });

  it("safely encodes special characters via URLSearchParams", () => {
    const url = new URL(
      generateGoogleCalendarUrl({
        ...baseEvent,
        title: "AT&T's \"Anime\" <Marathon>",
        timezone: "UTC",
      }),
    );
    expect(url.searchParams.get("text")).toBe("AT&T's \"Anime\" <Marathon>");
  });

  describe("timezone handling", () => {
    it("formats the local wall-clock time for the given timezone without shifting via UTC", () => {
      const nyUrl = new URL(
        generateGoogleCalendarUrl({ ...baseEvent, timezone: "America/New_York" }),
      );
      // 19:00 UTC in mid-August is 15:00 EDT (UTC-4), not a UTC-labelled 19:00.
      expect(nyUrl.searchParams.get("dates")).toBe("20260820T150000/20260820T153000");
      expect(nyUrl.searchParams.get("ctz")).toBe("America/New_York");

      const kolkataUrl = new URL(
        generateGoogleCalendarUrl({ ...baseEvent, timezone: "Asia/Kolkata" }),
      );
      // 19:00-19:30 UTC + 5:30 rolls into the next calendar day at 00:30-01:00 IST.
      expect(kolkataUrl.searchParams.get("dates")).toBe("20260821T003000/20260821T010000");
      expect(kolkataUrl.searchParams.get("ctz")).toBe("Asia/Kolkata");
    });

    it("falls back to the detected device timezone when none is provided", () => {
      const url = new URL(generateGoogleCalendarUrl(baseEvent));
      expect(url.searchParams.get("ctz")).toBe(detectDeviceTimezone());
    });

    it("throws a clear error for an invalid IANA timezone", () => {
      expect(() => generateGoogleCalendarUrl({ ...baseEvent, timezone: "Not/AZone" })).toThrow(
        /Not\/AZone/,
      );
    });

    it("falls back to UTC when device timezone detection fails", () => {
      vi.spyOn(Intl, "DateTimeFormat").mockImplementation(() => {
        throw new Error("unsupported environment");
      });
      expect(detectDeviceTimezone()).toBe("UTC");
    });
  });

  describe("recurrence", () => {
    it("omits recur when repeatType is 'none' or unset, ignoring repeatCount", () => {
      const withoutRepeatType = new URL(generateGoogleCalendarUrl({ ...baseEvent, timezone: "UTC" }));
      expect(withoutRepeatType.searchParams.has("recur")).toBe(false);

      const explicitNone = new URL(
        generateGoogleCalendarUrl({ ...baseEvent, timezone: "UTC", repeatType: "none", repeatCount: 5 }),
      );
      expect(explicitNone.searchParams.has("recur")).toBe(false);
    });

    it("generates RRULE strings for daily, weekly, and monthly repeats", () => {
      const daily = new URL(
        generateGoogleCalendarUrl({ ...baseEvent, timezone: "UTC", repeatType: "daily", repeatCount: 4 }),
      );
      expect(daily.searchParams.get("recur")).toBe("RRULE:FREQ=DAILY;COUNT=4");

      const weekly = new URL(
        generateGoogleCalendarUrl({ ...baseEvent, timezone: "UTC", repeatType: "weekly", repeatCount: 4 }),
      );
      expect(weekly.searchParams.get("recur")).toBe("RRULE:FREQ=WEEKLY;COUNT=4");

      const monthly = new URL(
        generateGoogleCalendarUrl({ ...baseEvent, timezone: "UTC", repeatType: "monthly", repeatCount: 3 }),
      );
      expect(monthly.searchParams.get("recur")).toBe("RRULE:FREQ=MONTHLY;COUNT=3");
    });

    it("defaults repeatCount to 1 when omitted, which produces no recur param", () => {
      const url = new URL(
        generateGoogleCalendarUrl({ ...baseEvent, timezone: "UTC", repeatType: "weekly" }),
      );
      expect(url.searchParams.has("recur")).toBe(false);
    });

    it("throws when repeatCount is less than 1", () => {
      expect(() =>
        generateGoogleCalendarUrl({ ...baseEvent, timezone: "UTC", repeatType: "weekly", repeatCount: 0 }),
      ).toThrow(/repeat count/i);
    });
  });

  describe("validation", () => {
    it("throws when title is missing or empty", () => {
      expect(() => generateGoogleCalendarUrl({ ...baseEvent, title: "" })).toThrow(/title/i);
      expect(() => generateGoogleCalendarUrl({ ...baseEvent, title: "   " })).toThrow(/title/i);
    });

    it("throws when startDate or endDate is missing", () => {
      expect(() =>
        generateGoogleCalendarUrl({ ...baseEvent, startDate: undefined as unknown as string }),
      ).toThrow(/start date/i);
      expect(() =>
        generateGoogleCalendarUrl({ ...baseEvent, endDate: undefined as unknown as string }),
      ).toThrow(/end date/i);
    });

    it("throws when startDate or endDate is not a valid date", () => {
      expect(() => generateGoogleCalendarUrl({ ...baseEvent, startDate: "not-a-date" })).toThrow(
        /start date/i,
      );
      expect(() => generateGoogleCalendarUrl({ ...baseEvent, endDate: "not-a-date" })).toThrow(
        /end date/i,
      );
    });

    it("throws when endDate is not after startDate", () => {
      expect(() =>
        generateGoogleCalendarUrl({ ...baseEvent, endDate: baseEvent.startDate }),
      ).toThrow(/after/i);
      expect(() =>
        generateGoogleCalendarUrl({ ...baseEvent, startDate: baseEvent.endDate, endDate: baseEvent.startDate }),
      ).toThrow(/after/i);
    });
  });
});
