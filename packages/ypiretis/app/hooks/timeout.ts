import {useEffect} from "react";

import {useLocation} from "react-router";

export type IUseTimeoutCallback = () => Promise<void> | void;

export interface IUseTimeoutOptions {
    readonly duration?: number;

    readonly enabled?: boolean;

    readonly onTimeout: IUseTimeoutCallback;
}

export default function useTimeout(options: IUseTimeoutOptions): void {
    const {duration = 0, enabled = false, onTimeout} = options;

    const {hash, pathname} = useLocation();

    useEffect(() => {
        if (enabled) {
            const identifier = setTimeout(onTimeout, Math.max(duration, 0));

            return () => {
                clearTimeout(identifier);
            };
        }
    }, [enabled, duration, hash, onTimeout, pathname]);
}
