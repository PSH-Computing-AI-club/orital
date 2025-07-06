import {useEffect} from "react";

export type IUseClockIntervalCallback = () => void;

export interface IUseClockIntervalOptions {
    readonly callback: IUseClockIntervalCallback;

    readonly interval: number;
}

function calculateClockDelay(interval: number): number {
    const now = Date.now();

    return interval - (now % interval);
}

export default function useClockInterval(
    options: IUseClockIntervalOptions,
): void {
    const {callback, interval} = options;

    useEffect(() => {
        let identifier: number;

        function scheduleNextTimeout(): void {
            const delay = calculateClockDelay(interval);

            identifier = setTimeout(
                () => {
                    callback();
                    scheduleNextTimeout();
                },

                delay,
                // **HACK:** Node.JS's typing of `NodeJS.Timeout` override the browser's
                // proper `number` return type.
            ) as unknown as number;
        }

        scheduleNextTimeout();

        return () => clearTimeout(identifier);
    }, [callback, interval]);
}
