import type {
    EventSourceMessage,
    FetchEventSourceInit,
} from "@microsoft/fetch-event-source";
import {fetchEventSource} from "@microsoft/fetch-event-source";

import {useEffect} from "react";

export type IEventSourceInit = FetchEventSourceInit;

export type IEventSourceMessage = EventSourceMessage;

export interface IEventSourceOptions {
    enabled?: boolean;

    init?: IEventSourceInit;
}

export default function useEventSource(
    url: string | URL,
    options: IEventSourceOptions = {},
): void {
    const {enabled = true, init = {}} = options;

    useEffect(() => {
        if (!enabled) {
            return undefined;
        }

        const {openWhenHidden = true} = init;

        const abortController = new AbortController();

        (async () => {
            await fetchEventSource(url.toString(), {
                ...init,

                openWhenHidden,
                signal: abortController.signal,
            });
        })();

        return () => {
            abortController.abort();
        };
    }, [enabled, init, url]);
}
