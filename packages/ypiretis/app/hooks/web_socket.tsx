import type {PropsWithChildren} from "react";
import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useSyncExternalStore,
} from "react";

const DEFAULT_RETRY_MAX_DELAY = 1000 * 30; // 1000 milliseconds * 30 = 30 seconds

const DEFAULT_RETRY_MIN_DELAY = 1000; // 1000 milliseconds = 1 second

const CONTEXT_WEB_SOCKET_CACHE = createContext<IWebSocketCache | null>(null);

type IReadyStateCallback = () => void;

type IWebSocketCache = Map<string, IWebSocketCacheEntry>;

interface IWebSocketCacheEntry {
    refCount: number;

    retryCount: number;

    retryTimeoutID: number | null;

    readonly readyStateSubscribers: Set<IReadyStateCallback>;

    readonly webSocket: WebSocket;
}

export type IWebSocketData = string | ArrayBufferLike | Blob | ArrayBufferView;

export type IWebSocketProtocols = string | string[];

export type IWebSocketReadyStates =
    | WebSocket["CONNECTING"]
    | WebSocket["OPEN"]
    | WebSocket["CLOSING"]
    | WebSocket["CLOSED"];

export type IUseWebSocketCloseCallback = (
    event: CloseEvent,
) => Promise<void> | void;

export type IUseWebSocketErrorCallback = (error: Event) => Promise<void> | void;

export type IUseWebSocketMessageCallback = (
    message: MessageEvent,
) => Promise<void> | void;

export type IUseWebSocketOpenCallback = (event: Event) => Promise<void> | void;

export type IUseWebSocketRetryCallback = (
    retry: number,
) => Promise<void> | void;

export interface IUseWebSocketOptions {
    readonly enabled?: boolean;

    readonly maxRetries?: number;

    readonly maxRetryDelay?: number;

    readonly minRetryDelay?: number;

    readonly protocols?: string;

    readonly onClose?: IUseWebSocketCloseCallback;

    readonly onError?: IUseWebSocketErrorCallback;

    readonly onMessage?: IUseWebSocketMessageCallback;

    readonly onOpen?: IUseWebSocketOpenCallback;

    readonly onRetry?: IUseWebSocketRetryCallback;
}

export interface IUseWebSocket {
    readonly readyState: IWebSocketReadyStates;

    readonly send: (data: IWebSocketData) => void;
}

function generateCacheKey(
    url: string | URL,
    protocols?: IWebSocketProtocols,
): string {
    return protocols
        ? JSON.stringify({
              protocols,
              url: url.toString(),
          })
        : url.toString();
}

function useWebSocketCache(): IWebSocketCache {
    const context = useContext(CONTEXT_WEB_SOCKET_CACHE);

    if (context === null) {
        throw new ReferenceError(
            `bad dispatch to 'useWebSocketCache' (not a child of 'WebSocketCacheProvider')`,
        );
    }

    return context;
}

export function WebSocketCacheProvider(props: PropsWithChildren) {
    const {children} = props;

    const cache = useMemo<IWebSocketCache>(() => new Map(), []);

    return (
        <CONTEXT_WEB_SOCKET_CACHE.Provider value={cache}>
            {children}
        </CONTEXT_WEB_SOCKET_CACHE.Provider>
    );
}

export default function useWebSocket(
    url: string | URL,
    options: IUseWebSocketOptions = {},
): IUseWebSocket {
    const {
        enabled = true,
        maxRetries = null,
        maxRetryDelay = DEFAULT_RETRY_MAX_DELAY,
        minRetryDelay = DEFAULT_RETRY_MIN_DELAY,
        onClose,
        onError,
        onMessage,
        onOpen,
        onRetry,
        protocols,
    } = options;

    const websocketCache = useWebSocketCache();

    const cacheKey = useMemo(
        () => generateCacheKey(url, protocols),

        [protocols, url],
    );

    const readyState = useSyncExternalStore(
        (callback) => {
            const entry = websocketCache.get(cacheKey);

            entry?.readyStateSubscribers.add(callback);

            return () => {
                entry?.readyStateSubscribers.delete(callback);
            };
        },

        () => {
            const entry = websocketCache.get(cacheKey);

            return (
                (entry?.webSocket.readyState as
                    | IWebSocketReadyStates
                    | undefined) ?? WebSocket.CLOSED
            );
        },

        () => WebSocket.CLOSED,
    );

    const send = useCallback(
        (data: IWebSocketData) => {
            const entry = websocketCache.get(cacheKey);

            if (entry?.webSocket.readyState === WebSocket.OPEN) {
                entry.webSocket.send(data);
            } else {
                throw ReferenceError(
                    "bad dispatch to 'IUseWebSocket.send' (web socket is not available or open)",
                );
            }
        },

        [cacheKey, websocketCache],
    );

    useEffect(() => {
        if (!enabled) {
            const entry = websocketCache.get(cacheKey) ?? null;

            if (entry?.retryTimeoutID) {
                clearTimeout(entry.retryTimeoutID);

                entry.retryTimeoutID = null;
            }

            return;
        }

        const reconnect = () => {
            const entry = websocketCache.get(cacheKey) ?? null;

            if (
                !entry ||
                maxRetries === null ||
                (maxRetries > 0 && entry.retryCount >= maxRetries) ||
                !enabled
            ) {
                websocketCache.delete(cacheKey);
                return;
            }

            const retryCount = entry.retryCount + 1;
            const delayWithBackoff = Math.min(
                minRetryDelay * 2 ** entry.retryCount,
                maxRetryDelay,
            );

            const delayWithJitter = Math.random() * delayWithBackoff;

            entry.retryCount = retryCount;
            entry.retryTimeoutID = setTimeout(
                connect,
                delayWithJitter,
            ) as unknown as number; // **HACK:** Node JS typings override the proper return
            // type typings for the browser `setTimeout`.

            if (onRetry) {
                onRetry(retryCount);
            }
        };

        const connect = () => {
            const webSocket = new WebSocket(url, protocols);

            const oldEntry = websocketCache.get(cacheKey);
            const newEntry: IWebSocketCacheEntry = {
                webSocket,

                refCount: oldEntry?.refCount ?? 0,
                retryCount: oldEntry?.retryCount ?? 0,
                retryTimeoutID: null,
                readyStateSubscribers: new Set(),
            };

            const notifyReadyStateSubscribers = () => {
                for (const callback of newEntry.readyStateSubscribers) {
                    callback();
                }
            };

            const internalOnClose = ((event: CloseEvent) => {
                webSocket.removeEventListener("close", internalOnClose);
                webSocket.removeEventListener("error", internalOnError);
                webSocket.removeEventListener("open", internalOnOpen);

                notifyReadyStateSubscribers();

                if (event.code === 1000) {
                    websocketCache.delete(cacheKey);
                } else {
                    reconnect();
                }
            }) satisfies IUseWebSocketCloseCallback;

            const internalOnError = ((_event: Event) => {
                webSocket.removeEventListener("close", internalOnClose);
                webSocket.removeEventListener("error", internalOnError);
                webSocket.removeEventListener("open", internalOnOpen);

                notifyReadyStateSubscribers();
            }) satisfies IUseWebSocketErrorCallback;

            const internalOnOpen = ((_event: Event) => {
                const entry = websocketCache.get(cacheKey);

                if (entry) {
                    entry.retryCount = 0;
                }

                notifyReadyStateSubscribers();
            }) satisfies IUseWebSocketOpenCallback;

            webSocket.addEventListener("close", internalOnClose);
            webSocket.addEventListener("error", internalOnError);
            webSocket.addEventListener("open", internalOnOpen);

            websocketCache.set(cacheKey, newEntry);

            notifyReadyStateSubscribers();
        };

        let entry = websocketCache.get(cacheKey);

        if (!entry || entry.refCount === 0) {
            connect();

            entry = websocketCache.get(cacheKey)!;
        }

        const {webSocket} = entry;

        if (onClose) {
            webSocket.addEventListener("close", onClose);
        }

        if (onError) {
            webSocket.addEventListener("error", onError);
        }

        if (onMessage) {
            webSocket.addEventListener("message", onMessage);
        }

        if (onOpen) {
            webSocket.addEventListener("open", onOpen);
        }

        entry.refCount += 1;

        return () => {
            const entry = websocketCache.get(cacheKey);

            if (!entry) {
                return;
            }

            const {webSocket} = entry;

            if (onClose) {
                webSocket.removeEventListener("close", onClose);
            }

            if (onError) {
                webSocket.removeEventListener("error", onError);
            }

            if (onMessage) {
                webSocket.removeEventListener("message", onMessage);
            }

            if (onOpen) {
                webSocket.removeEventListener("open", onOpen);
            }

            entry.refCount -= 1;

            if (entry.refCount < 1) {
                // **HACK:** So... React's `<StrictMode>` in development mode
                // re-mounts all `useEffects` when first rendered. It is supposed
                // to be for finding side effect defects in your code...
                //
                // That also means that the web socket will try to terminate
                // as it is still connecting to the server. So, we need to add
                // a complex hook interaction so that cleanly terminate the
                // socket if it is still connecting to the server.
                switch (webSocket.readyState) {
                    case WebSocket.CONNECTING: {
                        const cleanupOnClose = ((_event) => {
                            webSocket.removeEventListener(
                                "close",
                                cleanupOnClose,
                            );

                            webSocket.removeEventListener(
                                "open",
                                cleanupOnOpen,
                            );
                        }) satisfies IUseWebSocketCloseCallback;

                        const cleanupOnOpen = ((_event) => {
                            if (webSocket.readyState === WebSocket.OPEN) {
                                webSocket.close();
                            }
                        }) satisfies IUseWebSocketOpenCallback;

                        webSocket.addEventListener("close", cleanupOnClose);
                        webSocket.addEventListener("open", cleanupOnOpen);

                        break;
                    }

                    case WebSocket.OPEN:
                        webSocket.close(1000, "Normal Closure");
                        break;
                }
            }
        };
    }, [
        enabled,
        cacheKey,
        maxRetries,
        maxRetryDelay,
        minRetryDelay,
        onClose,
        onError,
        onMessage,
        onOpen,
        onRetry,
        protocols,
        url,
        websocketCache,
    ]);

    return {
        readyState,
        send,
    };
}
