export enum DATE_RANGE {
    ONE_MONTH = 30,
    THREE_MONTHS = 90,
    SIX_MONTHS = 180,
    ONE_YEAR = 365
}

export class DateHelper {
    /**
     * Returns the current date and time in Indian standard time
     * @returns ISO datetime format
     * Example: 2025-09-13T16:22:16.939Z
     */
    public static getCurrentISTDateTime(): Date {
        const currentDateTime = new Date();
        const utcTime = currentDateTime.getTime();
        const istOffset = 5.5 * 60 * 60 * 1000;
        const istDateTime = new Date(utcTime + istOffset);
        return istDateTime;
    }

    /**
     * Returns the date and time in Indian standard time
     * @param date - The date to convert
     * @returns The date and time in Indian standard time
     * Example: 2025-09-13T16:22:16.939Z
     */
    public static getISTDateTime(date: string | Date): Date | "" {
        if (!date) return "";

        const tranDate = new Date(date);
        if (isNaN(tranDate.getTime())) return "";

        const istOffset = 5.5 * 60 * 60 * 1000;
        return new Date(tranDate.getTime() + istOffset);
    }

    /**
     * @description Date in format YYYYMMDDHHMISS
     * @returns string
     */
    public static getTransactionFormatDateTime(dbTime: Date): string {
        const istOffsetMs = 5.5 * 60 * 60 * 1000; // +5:30 in ms
        const istDate = new Date(dbTime.getTime() + istOffsetMs);

        const [datePart, timePart] = istDate.toISOString().split('T');
        const formattedDate = datePart.replace(/-/g, '');
        const formattedTime = timePart.replace(/[:.Z]/g, '').slice(0, 6);
        return `${formattedDate}${formattedTime}`;
    }

    // Internal: Intl helpers to keep public method complexity low
    private static getShortParts(date: Date, locale: string, timeZone: string, includeTime: boolean, hour12: boolean) {
        const options: Intl.DateTimeFormatOptions = {
            timeZone,
            day: "2-digit",
            month: "short",
            year: "numeric",
            ...(includeTime ? { hour: "2-digit", minute: "2-digit", hour12 } : {}),
        };
        const parts = new Intl.DateTimeFormat(locale, options).formatToParts(date);
        const map: Record<"day" | "month" | "year" | "hour" | "minute" | "dayPeriod", string> = {
            day: "",
            month: "",
            year: "",
            hour: "",
            minute: "",
            dayPeriod: "",
        };
        for (const p of parts) {
            if (p.type !== "literal") (map as any)[p.type] = p.value;
        }
        return map;
    }

    private static getNumericMonth(date: Date, locale: string, timeZone: string): string {
        const parts = new Intl.DateTimeFormat(locale, { timeZone, month: "2-digit" }).formatToParts(date);
        const month = parts.find(p => p.type === "month")?.value || "";
        return month;
    }

    /**
     * Tokens:
     *  DD  = 2-digit day
     *  MM  = 2-digit month (01–12)
     *  MMM = short month name (Jan–Dec)
     *  YYYY = 4-digit year
     *  hh  = 2-digit hour (12-hour if hour12=true)
     *  mm  = 2-digit minute
     *  A   = AM/PM (uppercase)
     *
     * Defaults: Asia/Kolkata, en-US, hour12=true
     */
    public static formatByPattern(timestamp: Date | number | string | null | undefined, pattern: string = "DD MMM YYYY", opts: { locale?: string; timeZone?: string; hour12?: boolean } = {}): string {
        if (timestamp == null) return "";

        const { locale = "en-US", timeZone = "Asia/Kolkata", hour12 = true } = opts;
        const date = timestamp instanceof Date ? timestamp : new Date(timestamp);

        if (isNaN(date.getTime())) return "";

        const includeTime = /(hh|mm|A)/.test(pattern);
        const parts = this.getShortParts(date, locale, timeZone, includeTime, hour12);
        const mmNumeric = this.getNumericMonth(date, locale, timeZone);

        const map: Record<string, string> = {
            DD: parts.day,
            MMM: parts.month,
            MM: mmNumeric,
            YYYY: parts.year,
            hh: parts.hour,
            mm: parts.minute,
            A: parts.dayPeriod.toUpperCase(),
        };

        // Order matters so MMM is matched before MM
        return pattern.replace(/YYYY|MMM|MM|DD|hh|mm|A/g, t => map[t]);
    }

    /**
     * Returns date in format: DD MMM YYYY (Indian standard time)
     * Example: 10 Sep 2025
     */
    public static formatDateDDMMMYYYY(timestamp: Date | null | undefined): string {
        return this.formatByPattern(timestamp, "DD MMM YYYY");
    }

    /**
     * Returns date-time in format: DD MMM YYYY, hh:mm AM/PM (Indian standard time)
     * Example: 10 Sep 2025, 12:29 PM
     */
    public static formatDateTimeDDMMMYYYY(timestamp: Date | null | undefined): string {
        return this.formatByPattern(timestamp, "DD MMM YYYY, hh:mm A");
    }

    public static verifyDateRange(fromDate: Date | string, toDate: Date | string, dateRange: DATE_RANGE = DATE_RANGE.ONE_YEAR): boolean {
        const from = new Date(fromDate);
        const to = new Date(toDate);
        if (isNaN(from.getTime()) || isNaN(to.getTime()))
            throw new Error("Invalid date format");
        const diffMs = to.getTime() - from.getTime();
        const diffDays = diffMs / (1000 * 60 * 60 * 24);
        return diffDays <= dateRange;
    }

}
