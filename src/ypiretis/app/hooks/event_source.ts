import type {
    EventSourceMessage,
    FetchEventSourceInit,
} from "@microsoft/fetch-event-source";
import {fetchEventSource} from "@microsoft/fetch-event-source";

import {useEffect, useState} from "react";

export type IEventSourceInit = Omit<FetchEventSourceInit, "onmessage">;

export interface IEventSourceOptions {
    enabled?: boolean;

    eventName?: string;

    init?: IEventSourceInit;
}

export default function useEventSource(
    url: string | URL,
    options: IEventSourceOptions = {},
): EventSourceMessage | null {
    const {enabled = true, eventName = null, init = {}} = options;
    const {openWhenHidden = true} = init;

    const [message, setMessage] = useState<EventSourceMessage | null>(null);

    useEffect(() => {
        if (!enabled) {
            return undefined;
        }

        const abortController = new AbortController();

        setMessage(null);

        (async () => {
            await fetchEventSource(url.toString(), {
                ...init,

                openWhenHidden,
                signal: abortController.signal,

                onmessage(event) {
                    if (eventName) {
                        if (event.event === eventName) {
                            setMessage(event);
                        }
                        return;
                    }

                    setMessage(event);
                },
            });
        })();

        return () => {
            abortController.abort();
        };
    }, [enabled, eventName, init, url]);

    return message;
}
