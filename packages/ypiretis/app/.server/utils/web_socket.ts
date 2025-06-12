import {AsyncLocalStorage} from "node:async_hooks";

// **SOURCE:** hono/dist/types/helper/websocket/index.d.ts
export type IWSMessageReceive = string | Blob | ArrayBufferLike;

export type IWSReadyState = 0 | 1 | 2 | 3;

export interface ISendOptions {
    compress?: boolean;
}

export interface IWSContextInit<T = unknown> {
    send(data: string | ArrayBuffer | Uint8Array, options: ISendOptions): void;
    close(code?: number, reason?: string): void;
    raw?: T;
    readyState: IWSReadyState;
    url?: string | URL | null;
    protocol?: string | null;
}

export declare class IWSContext<T = unknown> {
    constructor(init: IWSContextInit<T>);
    send(
        source: string | ArrayBuffer | Uint8Array,
        options?: ISendOptions,
    ): void;
    raw?: T;
    binaryType: BinaryType;
    get readyState(): IWSReadyState;
    url: URL | null;
    protocol: string | null;
    close(code?: number, reason?: string): void;
}

export interface IWSEvents<T = unknown> {
    onOpen?: (evt: Event, ws: IWSContext<T>) => void;
    onMessage?: (
        evt: MessageEvent<IWSMessageReceive>,
        ws: IWSContext<T>,
    ) => void;
    onClose?: (evt: CloseEvent, ws: IWSContext<T>) => void;
    onError?: (evt: Event, ws: IWSContext<T>) => void;
}

export interface IWebSocketContext {
    upgradeWebSockets(events: IWSEvents): void;
}

export const WEBSOCKET_CONTEXT = new AsyncLocalStorage<IWebSocketContext>();

export function webSocket(events: IWSEvents): void {
    const context = WEBSOCKET_CONTEXT.getStore() ?? null;

    if (context === null) {
        throw new ReferenceError(
            `bad dispatch to 'webSocket' (not running in the 'WEBSOCKET_CONTEXT' context)`,
        );
    }

    context.upgradeWebSockets(events);
}
