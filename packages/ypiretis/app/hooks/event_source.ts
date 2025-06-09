import type {
    EventSourceMessage,
    FetchEventSourceInit,
} from "@microsoft/fetch-event-source";
import {fetchEventSource} from "@microsoft/fetch-event-source";

import {useEffect, useMemo} from "react";

const CACHE_CONNECTIONS = new Map<string, ICacheEntry>();

interface ICacheEntry {
    readonly abortController: AbortController;

    readonly subscribers: {
        readonly close: Set<IEventSourceCloseCallback>;

        readonly error: Set<IEventSourceErrorCallback>;

        readonly message: Set<IEventSourceMessageCallback>;

        readonly open: Set<IEventSourceOpenCallback>;
    };
}

export type IEventSourceCloseCallback = () => Promise<void> | void;

export type IEventSourceErrorCallback = (
    err: any,
) => number | null | undefined | void;

export type IEventSourceMessageCallback = (
    message: IEventSourceMessage,
) => Promise<void> | void;

export type IEventSourceOpenCallback = (
    response: Response,
) => Promise<void> | void;

export type IEventSourceInit = Omit<
    FetchEventSourceInit,
    | "fetch"
    | "onclose"
    | "onerror"
    | "onmessage"
    | "onopen"
    | "openWhenHidden"
    | "signal"
    | "window"
>;

export type IEventSourceMessage = EventSourceMessage;

export interface IEventSourceOptions {
    readonly enabled?: boolean;

    readonly onclose?: IEventSourceCloseCallback;

    readonly onerror?: IEventSourceErrorCallback;

    readonly onmessage?: IEventSourceMessageCallback;

    readonly onopen?: IEventSourceOpenCallback;
}

function generateCacheKey(
    url: string | URL,
    init: IEventSourceInit = {},
): string {
    const {
        body,
        credentials,
        headers,
        integrity,
        keepalive,
        method,
        mode,
        referrer,
        referrerPolicy,
    } = init;

    return JSON.stringify({
        url: url.toString(),

        body,
        credentials,
        headers,
        integrity,
        keepalive,
        method,
        mode,
        referrer,
        referrerPolicy,
    });
}

export default function useEventSource(
    url: string | URL,
    options: IEventSourceOptions = {},
    init: IEventSourceInit = {},
): void {
    const {enabled = true, onclose, onerror, onmessage, onopen} = options;

    const cacheKey = useMemo(() => generateCacheKey(url, init), [url, init]);

    useEffect(() => {
        if (!enabled) {
            return undefined;
        }

        let entry = CACHE_CONNECTIONS.get(cacheKey) ?? null;

        if (!entry) {
            const abortController = new AbortController();

            const closeSubscribers = new Set<IEventSourceCloseCallback>();
            const errorSubscribers = new Set<IEventSourceErrorCallback>();
            const messageSubscribers = new Set<IEventSourceMessageCallback>();
            const openSubscribers = new Set<IEventSourceOpenCallback>();

            entry = {
                abortController,

                subscribers: {
                    close: closeSubscribers,
                    error: errorSubscribers,
                    message: messageSubscribers,
                    open: openSubscribers,
                },
            };

            CACHE_CONNECTIONS.set(cacheKey, entry);

            fetchEventSource(url.toString(), {
                ...init,
                // **HACK:** Not really a hack... but we are taking this away to
                // simplify behaviour.
                openWhenHidden: true,
                signal: abortController.signal,

                async onclose() {
                    for (const callback of closeSubscribers) {
                        await callback();
                    }

                    abortController.abort();
                    CACHE_CONNECTIONS.delete(cacheKey);
                },

                onerror(error) {
                    let retryTimeout: number | null | undefined | void;

                    for (const callback of errorSubscribers) {
                        retryTimeout = callback(error);

                        if (typeof retryTimeout === "number") {
                            break;
                        }
                    }

                    abortController.abort();
                    CACHE_CONNECTIONS.delete(cacheKey);

                    return retryTimeout;
                },

                async onmessage(message) {
                    for (const callback of messageSubscribers) {
                        await callback(message);
                    }
                },

                async onopen(response) {
                    for (const callback of openSubscribers) {
                        await callback(response);
                    }

                    if (!response.ok) {
                        abortController.abort();
                        CACHE_CONNECTIONS.delete(cacheKey);
                    }
                },
            });
        }

        const {subscribers} = entry;

        const {
            close: closeSubscribers,
            error: errorSubscribers,
            message: messageSubscribers,
            open: openSubscribers,
        } = subscribers;

        if (onclose) {
            closeSubscribers.add(onclose);
        }

        if (onerror) {
            errorSubscribers.add(onerror);
        }

        if (onmessage) {
            messageSubscribers.add(onmessage);
        }

        if (onopen) {
            openSubscribers.add(onopen);
        }

        return () => {
            const entry = CACHE_CONNECTIONS.get(cacheKey);

            if (!entry) {
                return;
            }

            const {abortController, subscribers} = entry;

            const {
                close: closeSubscribers,
                error: errorSubscribers,
                message: messageSubscribers,
                open: openSubscribers,
            } = subscribers;

            if (onclose) {
                closeSubscribers.delete(onclose);
            }

            if (onerror) {
                errorSubscribers.delete(onerror);
            }

            if (onmessage) {
                messageSubscribers.delete(onmessage);
            }

            if (onopen) {
                openSubscribers.delete(onopen);
            }

            if (
                closeSubscribers.size === 0 &&
                errorSubscribers.size === 0 &&
                messageSubscribers.size === 0 &&
                openSubscribers.size === 0
            ) {
                abortController.abort();

                CACHE_CONNECTIONS.delete(cacheKey);
            }
        };
    }, [enabled, cacheKey, init, onclose, onerror, onmessage, onopen, url]);
}
