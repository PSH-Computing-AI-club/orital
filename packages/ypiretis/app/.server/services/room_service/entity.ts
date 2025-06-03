import type {IConnection} from "../../utils/event_stream";

import {IRoom} from "./room";

const SYMBOL_ENTITY_BRAND: unique symbol = Symbol();

export type IEntityEventData =
    | boolean
    | number
    | string
    | IEntityEventData[]
    | {[key: number | string]: IEntityEventData};

export interface IEntityEvent<N extends string, D extends IEntityEventData> {
    readonly event: N;

    readonly data: D;
}

export interface IEntityOptions {
    readonly connection: IConnection;

    readonly room: IRoom;
}

export interface IEntity<
    T extends IEntityEvent<N, D>,
    N extends string = string,
    D extends IEntityEventData = IEntityEventData,
> {
    [SYMBOL_ENTITY_BRAND]: true;

    readonly isConnected: boolean;

    dispose(): void;

    disconnect(): void;

    dispatch(event: T): void;
}

export class EntityConnectionClosedError extends Error {
    constructor(message: string, options?: ErrorOptions) {
        super(message, options);

        this.name = EntityConnectionClosedError.name;
    }
}

export function isEntity<
    T extends IEntityEvent<N, D>,
    N extends string = string,
    D extends IEntityEventData = IEntityEventData,
>(value: unknown): value is IEntity<T> {
    return (
        value !== null &&
        typeof value === "object" &&
        SYMBOL_ENTITY_BRAND in value
    );
}

export default function makeEntity<
    T extends IEntityEvent<N, D>,
    N extends string = string,
    D extends IEntityEventData = IEntityEventData,
>(options: IEntityOptions): IEntity<T> {
    const {room} = options;

    let connection: IConnection | null = options.connection;

    return {
        [SYMBOL_ENTITY_BRAND]: true,

        get isConnected() {
            return !!connection;
        },

        disconnect() {
            if (!connection) {
                throw new EntityConnectionClosedError(
                    `bad argument #0 to 'IEntity.dispose' (the connection was already closed)`,
                );
            }

            connection.abort();
            this.dispose();
        },

        dispose() {
            if (!connection) {
                throw new EntityConnectionClosedError(
                    `bad argument #0 to 'IEntity.dispose' (the connection was already closed)`,
                );
            }

            room.EVENT_ENTITY_DISPOSED.dispatch({
                entity: this,
            });

            connection = null;
        },

        dispatch(event) {
            const {data, event: name} = event;

            if (!connection) {
                throw new EntityConnectionClosedError(
                    `bad argument #0 to 'IEntity.dispose' (the connection was already closed)`,
                );
            }

            connection.send({
                event: name,
                data: JSON.stringify(data),
            });
        },
    };
}
