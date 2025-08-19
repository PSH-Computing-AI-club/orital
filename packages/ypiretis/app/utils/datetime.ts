import {useMemo} from "react";

import {useHydrated} from "remix-utils/use-hydrated";

import {SERVER_TIMEZONE} from "./constants";
import {NAVIGATOR_TIMEZONE} from "./navigator";

export type ICalendarMonth = [
    ICalendarWeek,
    ICalendarWeek,
    ICalendarWeek,
    ICalendarWeek,
    ICalendarWeek,
    ICalendarWeek,
];

export type ICalendarWeek = [
    ICalendarDay,
    ICalendarDay,
    ICalendarDay,
    ICalendarDay,
    ICalendarDay,
    ICalendarDay,
    ICalendarDay,
];

export interface ICalendarDay {
    readonly date: Date;
}

export function generateCalendarGrid(timestamp: number | Date): ICalendarMonth {
    const anchorDate = new Date(timestamp);

    const dayOfWeek = anchorDate.getUTCDay();
    const dayOfMonth = anchorDate.getUTCDate();

    anchorDate.setUTCDate(dayOfMonth - dayOfWeek);

    anchorDate.setUTCHours(0);
    anchorDate.setUTCMinutes(0);
    anchorDate.setUTCSeconds(0);
    anchorDate.setUTCMilliseconds(0);

    return Array.from(
        {length: 6},

        (_value, weekIndex) => {
            return Array.from(
                {length: 7},

                (_value, dayIndex) => {
                    const date = new Date(anchorDate);
                    const dayOffset = weekIndex * 7 + dayIndex;

                    date.setUTCDate(anchorDate.getUTCDate() + dayOffset);

                    return {
                        date,
                    } satisfies ICalendarDay;
                },
            ) as ICalendarWeek;
        },
    ) as ICalendarMonth;
}

export function toDate(timestamp: number | Date): Date {
    return typeof timestamp === "number" ? new Date(timestamp) : timestamp;
}

export function toLocalISOString(timestamp: Date | number) {
    const date = toDate(timestamp);

    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");

    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");

    return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export function toISOCalendarDayString(timestamp: number | Date): string {
    // **NOTE:** We are constructing a new `Date` instance here to preserve
    // immutability.
    const date = new Date(timestamp);

    date.setUTCHours(0);
    date.setUTCMinutes(0);
    date.setUTCSeconds(0);
    date.setUTCMilliseconds(0);

    return date.toISOString();
}

export function useDate(timestamp: number | Date): Date {
    return useMemo(() => {
        return toDate(timestamp);
    }, [timestamp]);
}

export function useGeneratedCalendarGrid(
    timestamp: number | Date,
): ICalendarMonth {
    return useMemo(() => {
        return generateCalendarGrid(timestamp);
    }, [timestamp]);
}

export function useTimezone(): string {
    return useHydrated() ? NAVIGATOR_TIMEZONE : SERVER_TIMEZONE;
}
