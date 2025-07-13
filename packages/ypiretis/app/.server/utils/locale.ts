import {Temporal} from "@js-temporal/polyfill";

export const FORMAT_DETAIL = {
    long: "DETAIL_LONG",

    short: "DETAIL_SHORT",
} as const;

export const SYSTEM_LOCALE = navigator.language;

export type IFormatDetail = (typeof FORMAT_DETAIL)[keyof typeof FORMAT_DETAIL];

export interface IFormatZonedDateTimeOptions {
    readonly detail?: IFormatDetail;
}

export function formatZonedDateTime(
    zonedDateTime: Temporal.ZonedDateTimeLike,
    options: IFormatZonedDateTimeOptions = {},
): string {
    const {detail = FORMAT_DETAIL.long} = options;

    switch (detail) {
        case FORMAT_DETAIL.long:
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

        case FORMAT_DETAIL.short:
            return Temporal.ZonedDateTime.from(zonedDateTime).toLocaleString(
                SYSTEM_LOCALE,
                {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                },
            );
    }
}
