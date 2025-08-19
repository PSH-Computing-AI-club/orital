import {Temporal} from "@js-temporal/polyfill";

import {useMemo} from "react";

import {toISOCalendarDayString, useDate, useTimezone} from "./datetime";
import {NAVIGATOR_LANGUAGE, NAVIGATOR_TIMEZONE} from "./navigator";
import type {IMakeCalendarGridOptions} from "./temporal";
import {makeCalendarGrid} from "./temporal";

export const FORMAT_DETAIL = {
    long: "long",

    short: "short",
} as const;

export type IFormatDetail = (typeof FORMAT_DETAIL)[keyof typeof FORMAT_DETAIL];

export type IMakeFormattedCalendarGridOptions = IMakeCalendarGridOptions &
    IFormatOptions;

export type IFormattedCalendarMonth = [
    IFormattedCalendarWeek,
    IFormattedCalendarWeek,
    IFormattedCalendarWeek,
    IFormattedCalendarWeek,
    IFormattedCalendarWeek,
    IFormattedCalendarWeek,
];

export type IFormattedCalendarWeek = [
    IFormattedCalendarDay,
    IFormattedCalendarDay,
    IFormattedCalendarDay,
    IFormattedCalendarDay,
    IFormattedCalendarDay,
    IFormattedCalendarDay,
    IFormattedCalendarDay,
];

export interface IFormattedCalendarDay {
    readonly isoTimestamp: string;

    readonly textualTimestamp: string;

    readonly zonedDateTime: Temporal.ZonedDateTime;
}

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

export function formatCalendarTimestamp(
    timestamp: number | Date,
    options: IFormatOptions = {},
): string {
    const {locale = NAVIGATOR_LANGUAGE, timezone = NAVIGATOR_TIMEZONE} =
        options;

    const formatter = new Intl.DateTimeFormat(locale, {
        timeZone: timezone,
        timeZoneName: "short",

        month: "long",
        year: "numeric",
    });

    return formatter.format(timestamp);
}

export function formatCalendarWeekdays(
    options: IFormatOptions = {},
): [string, string, string, string, string, string, string] {
    const {locale = NAVIGATOR_LANGUAGE, timezone = NAVIGATOR_TIMEZONE} =
        options;

    let anchorDate = Temporal.PlainDate.from({
        year: 1970,
        month: 1,
        day: 1,
    }).toZonedDateTime(timezone);

    anchorDate = anchorDate.subtract({
        days: anchorDate.dayOfWeek % 7,
    });

    return Array.from({length: 7}, (_, dayIndex) => {
        return anchorDate
            .add({days: dayIndex})
            .toLocaleString(locale, {weekday: "long"});
    }) as [string, string, string, string, string, string, string];
}

export function formatTimestamp(
    timestamp: number | Date,
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

export function makeFormattedCalendarGrid(
    options: IMakeFormattedCalendarGridOptions,
): IFormattedCalendarMonth {
    const {locale = NAVIGATOR_LANGUAGE, timezone = NAVIGATOR_LANGUAGE} =
        options;

    return makeCalendarGrid(options).map((calendarWeek, _index) => {
        return calendarWeek.map((calendarDay, _index) => {
            const zonedDateTime = calendarDay.toZonedDateTime(timezone);

            const isoTimestamp = zonedDateTime.toInstant().toString();
            const textualTimestamp = zonedDateTime.toLocaleString(locale, {
                day: "2-digit",
            });

            return {
                isoTimestamp,
                textualTimestamp,
                zonedDateTime,
            } satisfies IFormattedCalendarDay;
        }) as IFormattedCalendarWeek;
    }) as IFormattedCalendarMonth;
}

export function useFormattedCalendarGrid(
    options: IMakeFormattedCalendarGridOptions,
): IFormattedCalendarMonth {
    const {month, locale, timezone = useTimezone(), year} = options;

    const calendarGrid = useMemo(() => {
        return makeFormattedCalendarGrid({
            locale,
            month,
            timezone,
            year,
        });
    }, [locale, month, timezone, year]);

    return calendarGrid;
}

export function useFormattedCalendarWeekdays(
    options: IFormatOptions = {},
): [string, string, string, string, string, string, string] {
    const {locale, timezone = useTimezone()} = options;

    return useMemo(() => {
        return formatCalendarWeekdays({
            locale,
            timezone,
        });
    }, [locale, timezone]);
}

export function useFormattedCalendarTimestamp(
    timestamp: number | Date,
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

export function useFormattedTimestamp(
    timestamp: number | Date,
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
