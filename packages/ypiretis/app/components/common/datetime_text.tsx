import type {BoxProps} from "@chakra-ui/react";
import {Box} from "@chakra-ui/react";

import type {IDateLike} from "~/utils/datetime";
import {useTimezone} from "~/utils/datetime";
import type {IFormatDetail} from "~/utils/locale";
import {useFormattedTimestamp} from "~/utils/locale";

export interface IDatetimeTextProps extends BoxProps {
    readonly detail?: IFormatDetail;

    readonly timestamp: IDateLike;

    readonly timezone?: string;
}

export default function DatetimeText(props: IDatetimeTextProps) {
    const {detail, timestamp, timezone = useTimezone(), ...rest} = props;

    const {isoTimestamp, textualTimestamp} = useFormattedTimestamp(timestamp, {
        detail,
        timezone,
    });

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
