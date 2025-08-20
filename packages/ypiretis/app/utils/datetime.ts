import {useMemo} from "react";

import {useHydrated} from "remix-utils/use-hydrated";

import {SERVER_TIMEZONE} from "./constants";
import {NAVIGATOR_TIMEZONE} from "./navigator";

export type IDateLike = number | Date;

export function toDate(timestamp: IDateLike): Date {
    return typeof timestamp === "number" ? new Date(timestamp) : timestamp;
}

export function toLocalISOString(timestamp: IDateLike): string {
    const date = toDate(timestamp);

    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");

    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");

    return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export function toISOCalendarDayString(timestamp: IDateLike): string {
    // **NOTE:** We are constructing a new `Date` instance here to preserve
    // immutability.

    return zeroDay(timestamp).toISOString();
}

export function useDate(timestamp: IDateLike): Date {
    return useMemo(() => {
        return toDate(timestamp);
    }, [timestamp]);
}

export function useTimezone(): string {
    return useHydrated() ? NAVIGATOR_TIMEZONE : SERVER_TIMEZONE;
}

export function zeroDay(timestamp: IDateLike): Date {
    const date = new Date(timestamp);

    date.setUTCHours(0);
    date.setUTCMinutes(0);
    date.setUTCSeconds(0);
    date.setUTCMilliseconds(0);

    return date;
}
