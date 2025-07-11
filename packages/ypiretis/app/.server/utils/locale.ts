import {Temporal} from "@js-temporal/polyfill";

export const SYSTEM_LOCALE = navigator.language;

export function formatZonedDateTime(
    zonedDateTime: Temporal.ZonedDateTimeLike,
): string {
    return Temporal.ZonedDateTime.from(zonedDateTime).toLocaleString(
        SYSTEM_LOCALE,
        {
            day: "numeric",
            month: "long",
            year: "numeric",
            hour: "numeric",
            minute: "numeric",
        },
    );
}
