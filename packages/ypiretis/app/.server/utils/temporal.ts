import {Temporal} from "@js-temporal/polyfill";

export const UNIX_EPOCH = Temporal.PlainDate.from({
    month: 1,
    day: 1,
    year: 1970,
});

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

export type ICalendarDay = Temporal.PlainDate;

export interface IMakeCalendarGridOptions {
    readonly month: number;

    readonly year: number;
}

export function makeCalendarGrid(
    options: IMakeCalendarGridOptions,
): ICalendarMonth {
    const {month, year} = options;

    const firstDayOfMonth = Temporal.PlainDate.from({
        month,
        year,

        day: 1,
    });

    const anchorDate = firstDayOfMonth.subtract({
        days: firstDayOfMonth.dayOfWeek % 7,
    });

    return Array.from(
        {length: 6},

        (_value, weekIndex) => {
            return Array.from(
                {length: 7},

                (_value, dayIndex) => {
                    return anchorDate.add({
                        days: weekIndex * 7 + dayIndex,
                    });
                },
            ) as ICalendarWeek;
        },
    ) as ICalendarMonth;
}
