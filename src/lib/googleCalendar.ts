const GOOGLE_CALENDAR_BASE_URL = "https://calendar.google.com/calendar/render";

export type CalendarRepeatType = "none" | "daily" | "weekly" | "monthly";

export interface CalendarEventData {
  title: string;
  description?: string;
  startDate: Date | string;
  endDate: Date | string;
  location?: string;
  /** IANA timezone (e.g. "America/New_York"). Falls back to the device timezone, then "UTC". */
  timezone?: string;
  repeatType?: CalendarRepeatType;
  /** Number of occurrences. Ignored when repeatType is "none" or omitted. */
  repeatCount?: number;
}

const RRULE_FREQUENCY: Record<Exclude<CalendarRepeatType, "none">, string> = {
  daily: "DAILY",
  weekly: "WEEKLY",
  monthly: "MONTHLY",
};

function parseEventDate(value: Date | string, fieldName: string): Date {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`${fieldName} is not a valid date.`);
  }
  return date;
}

function isValidTimeZone(timeZone: string): boolean {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone });
    return true;
  } catch {
    return false;
  }
}

/** Detects the device's IANA timezone. Safe to call outside a browser (falls back to "UTC"). */
export function detectDeviceTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}

function resolveTimezone(preferred?: string): string {
  if (preferred) {
    if (!isValidTimeZone(preferred)) {
      throw new Error(`"${preferred}" is not a valid IANA timezone.`);
    }
    return preferred;
  }
  const detected = detectDeviceTimezone();
  return isValidTimeZone(detected) ? detected : "UTC";
}

/**
 * Formats an absolute Date instant as Google Calendar's local "YYYYMMDDTHHmmss" wall-clock
 * string for the given timezone. Using Intl (rather than the UTC getters) is what keeps the
 * displayed time from shifting when the target timezone differs from the machine's own.
 */
function formatDateForTimeZone(date: Date, timeZone: string): string {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  });

  const parts = Object.fromEntries(formatter.formatToParts(date).map((part) => [part.type, part.value]));
  // Some environments report midnight as hour "24" under hourCycle "h23" — normalize it.
  const hour = parts.hour === "24" ? "00" : parts.hour;

  return `${parts.year}${parts.month}${parts.day}T${hour}${parts.minute}${parts.second}`;
}

function buildRecurrenceRule(repeatType: CalendarRepeatType, repeatCount?: number): string | undefined {
  if (repeatType === "none" || !repeatCount || repeatCount <= 1) return undefined;
  return `RRULE:FREQ=${RRULE_FREQUENCY[repeatType]};COUNT=${repeatCount}`;
}

/**
 * Builds a "prefilled event" Google Calendar URL (the `action=TEMPLATE` link format) from
 * plain event data. Opening it lets the user review and save the event themselves — no
 * Google OAuth or Calendar API access involved.
 */
export function generateGoogleCalendarUrl(eventData: CalendarEventData): string {
  const title = eventData.title?.trim();
  if (!title) {
    throw new Error("Event title is required.");
  }
  if (eventData.startDate === undefined || eventData.startDate === null) {
    throw new Error("Event start date is required.");
  }
  if (eventData.endDate === undefined || eventData.endDate === null) {
    throw new Error("Event end date is required.");
  }

  const startDate = parseEventDate(eventData.startDate, "Start date");
  const endDate = parseEventDate(eventData.endDate, "End date");
  if (endDate.getTime() <= startDate.getTime()) {
    throw new Error("End date must be after start date.");
  }

  const repeatType = eventData.repeatType ?? "none";
  let repeatCount: number | undefined;
  if (repeatType !== "none") {
    repeatCount = eventData.repeatCount ?? 1;
    if (repeatCount < 1) {
      throw new Error("Repeat count must be at least 1.");
    }
  }

  const timezone = resolveTimezone(eventData.timezone);

  const params = new URLSearchParams();
  params.set("action", "TEMPLATE");
  params.set("text", title);
  params.set("dates", `${formatDateForTimeZone(startDate, timezone)}/${formatDateForTimeZone(endDate, timezone)}`);
  if (eventData.description) params.set("details", eventData.description);
  if (eventData.location) params.set("location", eventData.location);
  params.set("ctz", timezone);

  const recur = buildRecurrenceRule(repeatType, repeatCount);
  if (recur) params.set("recur", recur);

  return `${GOOGLE_CALENDAR_BASE_URL}?${params.toString()}`;
}
