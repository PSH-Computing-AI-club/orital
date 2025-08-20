import type {IDateLike} from "~/utils/datetime";
import type {IFormatDetail} from "~/utils/locale";
import {useFormattedTimestamp} from "~/utils/locale";

export interface IDatetimeTextProps {
    readonly detail?: IFormatDetail;

    readonly timestamp: IDateLike;
}

export default function DatetimeText(props: IDatetimeTextProps) {
    const {detail, timestamp} = props;

    const {isoTimestamp, textualTimestamp} = useFormattedTimestamp(timestamp, {
        detail,
    });

    return <time dateTime={isoTimestamp}>{textualTimestamp}</time>;
}
