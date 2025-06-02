import {useEffect} from "react";

import {useLocation} from "react-router";

export type ITimeoutCallback = () => Promise<void> | void;

export interface ITimeoutOptions {
    readonly duration?: number;

    readonly enabled?: boolean;
}

export default function useTimeout(
    callback: ITimeoutCallback,
    options: ITimeoutOptions,
): void {
    const {duration = 0, enabled = false} = options;

    const {hash, pathname} = useLocation();

    useEffect(() => {
        if (enabled) {
            const identifier = setTimeout(callback, Math.max(duration, 0));

            return () => {
                clearTimeout(identifier);
            };
        }
    }, [enabled, callback, duration, hash, pathname]);
}
