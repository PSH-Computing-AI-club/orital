import type {BoxProps} from "@chakra-ui/react";
import {Box} from "@chakra-ui/react";

import {type IDateLike} from "~/utils/datetime";
import {useTimezone} from "~/utils/datetime";
import {useFormattedCalendarDay} from "~/utils/locale";

export interface IDatetimeTextProps extends BoxProps {
    readonly timestamp: IDateLike;

    readonly timezone?: string;
}

export default function CalendarDayText(props: IDatetimeTextProps) {
    const {timestamp, timezone = useTimezone(), ...rest} = props;

    const {isoTimestamp, textualTimestamp} = useFormattedCalendarDay(
        timestamp,
        {
            timezone,
        },
    );

    return (
        <Box
            as="time"
            // @ts-expect-error - **HACK:** The `Box` component does not support the
            // `dateTime` property via typing. But, it will pass it through nonetheless.
            dateTime={isoTimestamp}
            {...rest}
        >
            {textualTimestamp}
        </Box>
    );
}
