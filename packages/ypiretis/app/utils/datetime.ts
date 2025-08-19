import {useMemo} from "react";

import {useHydrated} from "remix-utils/use-hydrated";

import {SERVER_TIMEZONE} from "./constants";
import {NAVIGATOR_TIMEZONE} from "./navigator";

export function toLocalISOCalendarString(timestamp: Date | number) {
    timestamp = typeof timestamp === "number" ? new Date(timestamp) : timestamp;

    const year = timestamp.getFullYear();
    const month = (timestamp.getMonth() + 1).toString().padStart(2, "0");

    return `${year}-${month}`;
}

export function toLocalISOString(timestamp: Date | number) {
    timestamp = typeof timestamp === "number" ? new Date(timestamp) : timestamp;

    const year = timestamp.getFullYear();
    const month = (timestamp.getMonth() + 1).toString().padStart(2, "0");
    const day = timestamp.getDate().toString().padStart(2, "0");

    const hours = timestamp.getHours().toString().padStart(2, "0");
    const minutes = timestamp.getMinutes().toString().padStart(2, "0");

    return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export function useDate(timestamp: number | Date): Date {
    return useMemo(() => {
        return typeof timestamp === "number" ? new Date(timestamp) : timestamp;
    }, [timestamp]);
}

export function useTimezone(): string {
    return useHydrated() ? NAVIGATOR_TIMEZONE : SERVER_TIMEZONE;
}
