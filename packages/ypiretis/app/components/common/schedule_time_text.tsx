import type {BoxProps} from "@chakra-ui/react";
import {Box} from "@chakra-ui/react";

import {type IDateLike} from "~/utils/datetime";
import {useTimezone} from "~/utils/datetime";
import {useFormattedScheduleTime} from "~/utils/locale";

export interface IScheduleTimeTextProps extends BoxProps {
    readonly timestamp: IDateLike;

    readonly timezone?: string;
}

export default function ScheduleTimeText(props: IScheduleTimeTextProps) {
    const {timestamp, timezone = useTimezone(), ...rest} = props;

    const {isoTimestamp, textualTimestamp} = useFormattedScheduleTime(
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
