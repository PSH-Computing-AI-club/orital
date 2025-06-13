import type {PropsWithChildren} from "react";
import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useSyncExternalStore,
} from "react";

const CONTEXT_WEB_SOCKET_CACHE = createContext<IWebSocketCache | null>(null);

type IReadyStateCallback = () => void;

type IWebSocketCache = Map<string, IWebSocketCacheEntry>;

interface IWebSocketCacheEntry {
    refCount: number;

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

export interface IUseWebSocketOptions {
    readonly enabled?: boolean;

    readonly onClose?: IUseWebSocketCloseCallback;

    readonly onError?: IUseWebSocketErrorCallback;

    readonly onMessage?: IUseWebSocketMessageCallback;

    readonly onOpen?: IUseWebSocketOpenCallback;

    readonly protocols?: string;
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
        protocols,
        onClose,
        onError,
        onMessage,
        onOpen,
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
            return undefined;
        }

        let entry = websocketCache.get(cacheKey) ?? null;

        if (!entry) {
            const webSocket = new WebSocket(url, protocols);

            entry = {
                refCount: 0,
                readyStateSubscribers: new Set(),
                webSocket,
            };

            const notifyReadyStateSubscribers = () => {
                for (const callback of entry!.readyStateSubscribers) {
                    callback();
                }
            };

            const internalOnClose = ((_event) => {
                webSocket.removeEventListener("close", internalOnClose);
                webSocket.removeEventListener("error", internalOnError);
                webSocket.removeEventListener("open", internalOnOpen);

                websocketCache.delete(cacheKey);

                notifyReadyStateSubscribers();
            }) satisfies IUseWebSocketCloseCallback;

            const internalOnError = ((_event) => {
                webSocket.removeEventListener("close", internalOnClose);
                webSocket.removeEventListener("error", internalOnError);
                webSocket.removeEventListener("open", internalOnOpen);

                websocketCache.delete(cacheKey);

                notifyReadyStateSubscribers();
            }) satisfies IUseWebSocketErrorCallback;

            const internalOnOpen = ((_event) => {
                notifyReadyStateSubscribers();
            }) satisfies IUseWebSocketOpenCallback;

            websocketCache.set(cacheKey, entry);

            webSocket.addEventListener("close", internalOnClose);
            webSocket.addEventListener("error", internalOnError);
            webSocket.addEventListener("open", internalOnOpen);
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
                webSocket.close(1000, "Normal Closure");
            }
        };
    }, [
        enabled,
        cacheKey,
        onClose,
        onError,
        onMessage,
        onOpen,
        protocols,
        url,
        websocketCache,
    ]);

    return {
        readyState,
        send,
    };
}
