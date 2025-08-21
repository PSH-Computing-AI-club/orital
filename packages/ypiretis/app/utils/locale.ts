import {Temporal} from "@js-temporal/polyfill";

import {useMemo} from "react";

import type {IDateLike} from "./datetime";
import {toISOCalendarDayString, useDate, useTimezone} from "./datetime";
import {NAVIGATOR_LANGUAGE, NAVIGATOR_TIMEZONE} from "./navigator";

export const FORMAT_DETAIL = {
    long: "long",

    short: "short",
} as const;

export type IFormatDetail = (typeof FORMAT_DETAIL)[keyof typeof FORMAT_DETAIL];

export interface IFormatOptions {
    readonly locale?: string;

    readonly timezone?: string;
}

export interface IFormatTimestampOptions extends IFormatOptions {
    readonly detail?: IFormatDetail;
}

export interface IUseFormatted {
    readonly isoTimestamp: string;

    readonly textualTimestamp: string;
}

export interface IUseFormattedRange
    extends Omit<IUseFormatted, "isoTimestamp"> {
    readonly endAtISOTimestamp: string;

    readonly startAtISOTimestamp: string;

    readonly textualTimestamp: string;
}

export function formatCalendarDay(
    timestamp: IDateLike,
    options: IFormatOptions = {},
): string {
    const {locale = NAVIGATOR_LANGUAGE, timezone = NAVIGATOR_TIMEZONE} =
        options;

    const formatter = new Intl.DateTimeFormat(locale, {
        timeZone: timezone,

        day: "2-digit",
    });

    return formatter.format(timestamp);
}

export function formatCalendarTimestamp(
    timestamp: IDateLike,
    options: IFormatOptions = {},
): string {
    const {locale = NAVIGATOR_LANGUAGE, timezone = NAVIGATOR_TIMEZONE} =
        options;

    const formatter = new Intl.DateTimeFormat(locale, {
        timeZone: timezone,
        timeZoneName: "longGeneric",

        month: "long",
        year: "numeric",
    });

    return formatter.format(timestamp);
}

export function formatCalendarWeekdays(
    days: [
        IDateLike,
        IDateLike,
        IDateLike,
        IDateLike,
        IDateLike,
        IDateLike,
        IDateLike,
    ],
    options: IFormatOptions = {},
): [string, string, string, string, string, string, string] {
    const {locale = NAVIGATOR_LANGUAGE, timezone = NAVIGATOR_TIMEZONE} =
        options;

    const formatter = new Intl.DateTimeFormat(locale, {
        timeZone: timezone,

        weekday: "long",
    });

    return days.map((day, _index) => {
        return formatter.format(day);
    }) as [string, string, string, string, string, string, string];
}

export function formatScheduleTime(
    timestamp: IDateLike,
    options: IFormatOptions = {},
): string {
    const {locale = NAVIGATOR_LANGUAGE, timezone = NAVIGATOR_TIMEZONE} =
        options;

    const formatter = new Intl.DateTimeFormat(locale, {
        timeZone: timezone,

        hour: "numeric",
        minute: "numeric",
    });

    return formatter.format(timestamp);
}

export function formatTimestamp(
    timestamp: IDateLike,
    options: IFormatTimestampOptions = {},
): string {
    const {
        detail = FORMAT_DETAIL.long,
        locale = NAVIGATOR_LANGUAGE,
        timezone = NAVIGATOR_TIMEZONE,
    } = options;

    let formatter: Intl.DateTimeFormat;

    switch (detail) {
        case FORMAT_DETAIL.long:
            formatter = new Intl.DateTimeFormat(locale, {
                timeZone: timezone,
                timeZoneName: "short",

                day: "numeric",
                month: "long",
                year: "numeric",
                hour: "numeric",
                minute: "numeric",
            });

            break;

        case FORMAT_DETAIL.short:
            formatter = new Intl.DateTimeFormat(locale, {
                timeZone: timezone,

                day: "numeric",
                month: "long",
                year: "numeric",
            });

            break;
    }

    return formatter.format(timestamp);
}

export function formatTimestampRange(
    startAtTimestamp: IDateLike,
    endtAtTimestamp: IDateLike,
    options: IFormatTimestampOptions = {},
): string {
    const {
        detail = FORMAT_DETAIL.long,
        locale = NAVIGATOR_LANGUAGE,
        timezone = NAVIGATOR_TIMEZONE,
    } = options;

    let formatter: Intl.DateTimeFormat;

    switch (detail) {
        case FORMAT_DETAIL.long:
            formatter = new Intl.DateTimeFormat(locale, {
                timeZone: timezone,
                timeZoneName: "short",

                day: "numeric",
                month: "long",
                year: "numeric",
                hour: "numeric",
                minute: "numeric",
            });

            break;

        case FORMAT_DETAIL.short:
            formatter = new Intl.DateTimeFormat(locale, {
                timeZone: timezone,

                day: "numeric",
                month: "long",
                year: "numeric",
            });

            break;
    }

    return formatter.formatRange(startAtTimestamp, endtAtTimestamp);
}

export function useFormattedCalendarDay(
    timestamp: IDateLike,
    options: IFormatOptions = {},
): IUseFormatted {
    const {locale, timezone = useTimezone()} = options;

    const date = useDate(timestamp);

    const isoTimestamp = useMemo(() => {
        return date.toISOString();
    }, [date]);

    const textualTimestamp = useMemo(() => {
        return formatCalendarDay(date, {
            locale,
            timezone,
        });
    }, [date, locale, timezone]);

    return {
        isoTimestamp,
        textualTimestamp,
    };
}

export function useFormattedCalendarWeekdays(
    days: [
        IDateLike,
        IDateLike,
        IDateLike,
        IDateLike,
        IDateLike,
        IDateLike,
        IDateLike,
    ],
    options: IFormatOptions = {},
): [string, string, string, string, string, string, string] {
    const {locale, timezone = useTimezone()} = options;

    return useMemo(() => {
        return formatCalendarWeekdays(days, {
            locale,
            timezone,
        });
    }, [days, locale, timezone]);
}

export function useFormattedCalendarTimestamp(
    timestamp: IDateLike,
    options: IFormatOptions = {},
): IUseFormatted {
    const {locale, timezone = useTimezone()} = options;

    const date = useDate(timestamp);

    const isoTimestamp = useMemo(() => {
        return toISOCalendarDayString(date);
    }, [date]);

    const textualTimestamp = useMemo(() => {
        return formatCalendarTimestamp(date, {
            locale,
            timezone,
        });
    }, [date, locale, timezone]);

    return {
        isoTimestamp,
        textualTimestamp,
    };
}

export function useFormattedScheduleTime(
    timestamp: IDateLike,
    options: IFormatOptions = {},
): IUseFormatted {
    const {locale, timezone = useTimezone()} = options;

    const date = useDate(timestamp);

    const isoTimestamp = useMemo(() => {
        return date.toISOString();
    }, [date]);

    const textualTimestamp = useMemo(() => {
        return formatScheduleTime(date, {
            locale,
            timezone,
        });
    }, [date, locale, timezone]);

    return {
        isoTimestamp,
        textualTimestamp,
    };
}

export function useFormattedTimestamp(
    timestamp: IDateLike,
    options: IFormatTimestampOptions = {},
): IUseFormatted {
    const {detail, locale, timezone = useTimezone()} = options;

    const date = useDate(timestamp);

    const isoTimestamp = useMemo(() => {
        return date.toISOString();
    }, [date]);

    const textualTimestamp = useMemo(() => {
        return formatTimestamp(date, {
            detail,
            locale,
            timezone,
        });
    }, [date, detail, locale, timezone]);

    return {
        isoTimestamp,
        textualTimestamp,
    };
}

export function useFormattedTimestampRange(
    startAtTimestamp: IDateLike,
    endAtTimestamp: IDateLike,
    options: IFormatTimestampOptions = {},
): IUseFormattedRange {
    const {detail, locale, timezone = useTimezone()} = options;

    const startAtDate = useDate(startAtTimestamp);
    const endAtDate = useDate(endAtTimestamp);

    const endAtISOTimestamp = useMemo(() => {
        return endAtDate.toISOString();
    }, [endAtDate]);

    const startAtISOTimestamp = useMemo(() => {
        return startAtDate.toISOString();
    }, [startAtDate]);

    const textualTimestamp = useMemo(() => {
        return formatTimestampRange(startAtDate, endAtDate, {
            detail,
            locale,
            timezone,
        });
    }, [detail, endAtDate, locale, startAtDate, timezone]);

    return {
        endAtISOTimestamp,
        startAtISOTimestamp,
        textualTimestamp,
    };
}
