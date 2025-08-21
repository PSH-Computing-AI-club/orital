import type {BoxProps} from "@chakra-ui/react";
import {Box} from "@chakra-ui/react";

import {type IDateLike} from "~/utils/datetime";
import {useTimezone} from "~/utils/datetime";
import type {IFormatDetail} from "~/utils/locale";
import {useFormattedTimestampRange} from "~/utils/locale";

export interface IDatetimeRangeTextProps extends BoxProps {
    readonly detail?: IFormatDetail;

    readonly endAtTimestamp: IDateLike;

    readonly startAtTimestamp: IDateLike;

    readonly timezone?: string;
}

export default function DatetimeRangeText(props: IDatetimeRangeTextProps) {
    const {
        detail,
        endAtTimestamp,
        startAtTimestamp,
        timezone = useTimezone(),
        ...rest
    } = props;

    const {startAtISOTimestamp, textualTimestamp} = useFormattedTimestampRange(
        startAtTimestamp,
        endAtTimestamp,

        {
            detail,
            timezone,
        },
    );

    return (
        <Box
            as="time"
            // @ts-expect-error - **HACK:** The `Box` component does not support the
            // `dateTime` property via typing. But, it will pass it through nonetheless.
            //
            // **HACK:** The `<time>` element does not support passing a date range into
            // the `dateTime` attribute. But, it is the only element we can use to semantically
            // represent datetime data. Therefore, we are going to pass only the start at
            // date into the `dateTime` attribute.
            //
            // We could use `Intl.DateTimeFormat.formatRangeToParts`... but then we would
            // have to manually format how we express the datetime range to the user. Which
            // would defeat the whole purpose of using the browser's automagical localization
            // APIs.
            dateTime={startAtISOTimestamp}
            {...rest}
        >
            {textualTimestamp}
        </Box>
    );
}
