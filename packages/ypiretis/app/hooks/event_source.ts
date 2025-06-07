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

    eventName?: string;

    init?: IEventSourceInit;
}

export default function useEventSource(
    url: string | URL,
    options: IEventSourceOptions = {},
): void {
    const {enabled = true, eventName = null, init = {}} = options;

    useEffect(() => {
        if (!enabled) {
            return undefined;
        }

        const {onmessage, openWhenHidden = true} = init;

        const abortController = new AbortController();

        (async () => {
            await fetchEventSource(url.toString(), {
                ...init,

                openWhenHidden,
                signal: abortController.signal,

                onmessage: onmessage
                    ? (message) => {
                          if (eventName) {
                              if (message.event === eventName) {
                                  onmessage(message);
                              }

                              return;
                          }

                          onmessage(message);
                      }
                    : undefined,
            });
        })();

        return () => {
            abortController.abort();
        };
    }, [enabled, eventName, init, url]);
}
