import {useCallback, useMemo, useState} from "react";

import type {
    IUseClockIntervalCallback,
    IUseClockIntervalOptions,
} from "~/hooks/clock_interval";
import useClockInterval from "~/hooks/clock_interval";

const DURATION_SECOND_MILLISECONDS = 1000;

const DURATION_MINUTE_MILLISECONDS = 1000 * 60;

export interface ITimeDeltaTextProps {
    readonly endMilliseconds: number;
}

function calculateTimeDelta(endMilliseconds: number): number {
    const nowMilliseconds = Date.now();

    return Math.max(endMilliseconds - nowMilliseconds, 0);
}

export function TimeDeltaText(props: ITimeDeltaTextProps) {
    const {endMilliseconds} = props;

    const [deltaMilliseconds, setDeltaMilliseconds] = useState<number>(
        calculateTimeDelta(endMilliseconds),
    );

    const updateDeltaMilliseconds = useCallback(
        ((): void => {
            setDeltaMilliseconds(calculateTimeDelta(endMilliseconds));
        }) satisfies IUseClockIntervalCallback,
        [endMilliseconds, setDeltaMilliseconds],
    );

    const isOverMinuteRemaining =
        deltaMilliseconds >= DURATION_MINUTE_MILLISECONDS;

    const useClockIntervalOptions = useMemo(
        () =>
            ({
                callback: updateDeltaMilliseconds,
                interval: DURATION_SECOND_MILLISECONDS,
            }) satisfies IUseClockIntervalOptions,
        [updateDeltaMilliseconds],
    );

    useClockInterval(useClockIntervalOptions);

    return isOverMinuteRemaining
        ? `${Math.trunc(deltaMilliseconds / DURATION_MINUTE_MILLISECONDS)}m`
        : `${Math.trunc(deltaMilliseconds / DURATION_SECOND_MILLISECONDS)}s`;
}
