import type {BoxProps} from "@chakra-ui/react";
import {Box} from "@chakra-ui/react";

import type {IDateLike} from "~/utils/datetime";
import {useFormattedCalendarDay} from "~/utils/locale";

export interface IDatetimeTextProps extends BoxProps {
    readonly timestamp: IDateLike;
}

export default function CalendarDayText(props: IDatetimeTextProps) {
    const {timestamp, ...rest} = props;

    const {isoTimestamp, textualTimestamp} = useFormattedCalendarDay(timestamp);

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
