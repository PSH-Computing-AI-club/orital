import {NAVIGATOR_LANGUAGE, NAVIGATOR_TIMEZONE} from "./navigator";

export const FORMAT_DETAIL = {
    long: "long",

    short: "short",
} as const;

export type IFormatDetail = (typeof FORMAT_DETAIL)[keyof typeof FORMAT_DETAIL];

export interface IFormatTimestampOptions {
    readonly detail?: IFormatDetail;

    readonly locale?: string;

    readonly timezone?: string;
}

export function formatTimestamp(
    timestamp: Date | number,
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
