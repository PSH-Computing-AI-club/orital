import {Temporal} from "@js-temporal/polyfill";

import BUILDTIME_ENVIRONMENT from "../configuration/buildtime_environment";

import type {IMakeCalendarGridOptions} from "./temporal";
import {makeCalendarGrid} from "./temporal";

const {SERVER_TIMEZONE} = BUILDTIME_ENVIRONMENT;

export type IZonedCalendarMonth = [
    IZonedCalendarWeek,
    IZonedCalendarWeek,
    IZonedCalendarWeek,
    IZonedCalendarWeek,
    IZonedCalendarWeek,
    IZonedCalendarWeek,
];

export type IZonedCalendarWeek = [
    IZonedCalendarDay,
    IZonedCalendarDay,
    IZonedCalendarDay,
    IZonedCalendarDay,
    IZonedCalendarDay,
    IZonedCalendarDay,
    IZonedCalendarDay,
];

export type IZonedCalendarDay = Temporal.ZonedDateTime;

export interface IMakeZonedCalendarGridOptions
    extends IMakeCalendarGridOptions {
    readonly timezone?: string;
}

export function makeZonedCalendarGrid(
    options: IMakeZonedCalendarGridOptions,
): IZonedCalendarMonth {
    const {timezone = SERVER_TIMEZONE, ...rest} = options;

    return makeCalendarGrid(rest).map((week, _index) => {
        return week.map((day, _index) => {
            return day.toZonedDateTime(timezone) satisfies IZonedCalendarDay;
        }) as IZonedCalendarWeek;
    }) as IZonedCalendarMonth;
}
