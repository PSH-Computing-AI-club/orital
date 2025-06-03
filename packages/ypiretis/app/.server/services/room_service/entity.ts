import type {IConnection} from "../../utils/event_stream";
import type {ExtendLiterals} from "../../utils/types";

import {IRoom} from "./room";

const SYMBOL_ENTITY_BRAND: unique symbol = Symbol();

export const ENTITY_STATES = {
    connected: "STATE_CONNECTED",

    disposed: "STATE_DISPOSED",
} as const;

export type IEntityStates = (typeof ENTITY_STATES)[keyof typeof ENTITY_STATES];

export type IEntityEventData =
    | boolean
    | number
    | string
    | IEntityEventData[]
    | {[key: number | string]: IEntityEventData};

export type IGenericEntity = IEntity<
    IEntityEvent<string, IEntityEventData>,
    IEntityStates,
    string,
    IEntityEventData
>;

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
    S extends string = IEntityStates,
    N extends string = string,
    D extends IEntityEventData = IEntityEventData,
> {
    [SYMBOL_ENTITY_BRAND]: true;

    readonly state: ExtendLiterals<S, IEntityStates>;

    _disconnect(): void;

    _dispatch(event: T): void;

    _dispose(): void;
}

export class EntityDisposed extends Error {
    constructor(message: string, options?: ErrorOptions) {
        super(message, options);

        this.name = EntityDisposed.name;
    }
}

export class InvalidEntityTypeError extends Error {
    constructor(message: string, options?: ErrorOptions) {
        super(message, options);

        this.name = InvalidEntityTypeError.name;
    }
}

export function isEntity<
    T extends IEntityEvent<N, D>,
    S extends string = IEntityStates,
    N extends string = string,
    D extends IEntityEventData = IEntityEventData,
>(value: unknown): value is IEntity<T, S> {
    return (
        value !== null &&
        typeof value === "object" &&
        SYMBOL_ENTITY_BRAND in value
    );
}

export default function makeEntity<
    T extends IEntityEvent<N, D>,
    S extends string = IEntityStates,
    N extends string = string,
    D extends IEntityEventData = IEntityEventData,
>(options: IEntityOptions): IEntity<T, S> {
    const {room} = options;

    let connection: IConnection | null = options.connection;

    return {
        [SYMBOL_ENTITY_BRAND]: true,

        get state() {
            return (
                connection ? ENTITY_STATES.connected : ENTITY_STATES.disposed
            ) as ExtendLiterals<S, IEntityStates>;
        },

        _disconnect() {
            if (!connection) {
                throw new EntityDisposed(
                    `bad dispatch to 'IEntity.disconnect' (the connection to the entity was already closed)`,
                );
            }

            connection.abort();

            connection = null;
        },

        _dispatch(event) {
            const {data, event: name} = event;

            if (!connection) {
                throw new EntityDisposed(
                    `bad dispatch to 'IEntity.dispatch' (the connection to the entity is closed)`,
                );
            }

            connection.send({
                event: name,
                data: JSON.stringify(data),
            });
        },

        _dispose() {
            if (!connection) {
                throw new EntityDisposed(
                    `bad dispatch to 'IEntity.dispose' (the connection to the entity was already closed)`,
                );
            }

            room._entityDisposed(this as unknown as IGenericEntity);

            connection = null;
        },
    };
}
