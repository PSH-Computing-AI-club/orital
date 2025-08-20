import type {IDateLike} from "~/utils/datetime";
import {useFormattedCalendarDay} from "~/utils/locale";

export interface IDatetimeTextProps {
    readonly timestamp: IDateLike;
}

export default function CalendarDayText(props: IDatetimeTextProps) {
    const {timestamp} = props;

    const {isoTimestamp, textualTimestamp} = useFormattedCalendarDay(timestamp);

    return <time dateTime={isoTimestamp}>{textualTimestamp}</time>;
}
