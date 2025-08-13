import {useMemo} from "react";

import {useHydrated} from "remix-utils/use-hydrated";

import {SERVER_TIMEZONE} from "~/utils/constants";
import {toLocalISOString} from "~/utils/datetime";
import type {IFormatDetail} from "~/utils/locale";
import {formatTimestamp} from "~/utils/locale";
import {NAVIGATOR_TIMEZONE} from "~/utils/navigator";

export interface IDatetimeTextProps {
    readonly detail?: IFormatDetail;

    readonly timestamp: number | Date;
}

export default function DatetimeText(props: IDatetimeTextProps) {
    const {detail, timestamp} = props;

    const timezone = useHydrated() ? NAVIGATOR_TIMEZONE : SERVER_TIMEZONE;

    const date =
        typeof timestamp === "number"
            ? useMemo(() => {
                  return new Date(timestamp);
              }, [timestamp])
            : timestamp;

    const isoTimestamp = useMemo(() => {
        return toLocalISOString(date);
    }, [date]);

    const textualTimestamp = useMemo(() => {
        return formatTimestamp(date, {
            detail,
            timezone,
        });
    }, [date, detail, timezone]);

    return <time dateTime={isoTimestamp}>{textualTimestamp}</time>;
}
