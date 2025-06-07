import type {IEvent} from "../../../utils/event";
import makeEvent from "../../../utils/event";

import type {IConnection} from "../../utils/event_stream";
import type {ExtendLiterals} from "../../utils/types";

import {IRoom} from "./room";

const SYMBOL_ENTITY_BRAND: unique symbol = Symbol();

export const SYMBOL_ENTITY_ON_DISPOSE: unique symbol = Symbol();

export const ENTITY_STATES = {
    connected: "STATE_CONNECTED",

    disposed: "STATE_DISPOSED",
} as const;

export type IEntityStates = (typeof ENTITY_STATES)[keyof typeof ENTITY_STATES];

export type IEntityMessageData =
    | boolean
    | number
    | string
    | IEntityMessageData[]
    | {[key: number | string]: IEntityMessageData};

export type IGenericEntity = IEntity<
    IEntityMessage<string, IEntityMessageData>,
    IEntityStates,
    string,
    IEntityMessageData
>;

export interface IEntityMessage<
    N extends string,
    D extends IEntityMessageData,
> {
    readonly event: N;

    readonly data: D;
}

export interface IEntityStateUpdateEvent<S extends string> {
    readonly oldState: ExtendLiterals<S, IEntityStates>;

    readonly newState: ExtendLiterals<S, IEntityStates>;
}

export interface IEntityOptions {
    readonly connection: IConnection;

    readonly id: number;

    readonly room: IRoom;
}

export interface IEntity<
    T extends IEntityMessage<N, D>,
    S extends string = IEntityStates,
    N extends string = string,
    D extends IEntityMessageData = IEntityMessageData,
> {
    [SYMBOL_ENTITY_BRAND]: true;

    [SYMBOL_ENTITY_ON_DISPOSE]?: () => void;

    readonly EVENT_STATE_UPDATE: IEvent<
        IEntityStateUpdateEvent<ExtendLiterals<S, IEntityStates>>
    >;

    readonly id: number;

    readonly state: ExtendLiterals<S, IEntityStates>;

    _disconnect(): void;

    _dispatch(event: T): void;

    _dispose(): void;
}

export class EntityConnectionError extends Error {
    constructor(message: string, options?: ErrorOptions) {
        super(message, options);

        this.name = EntityConnectionError.name;
    }
}

export class EntityDisposedError extends Error {
    constructor(message: string, options?: ErrorOptions) {
        super(message, options);

        this.name = EntityDisposedError.name;
    }
}

export class InvalidEntityTypeError extends Error {
    constructor(message: string, options?: ErrorOptions) {
        super(message, options);

        this.name = InvalidEntityTypeError.name;
    }
}

export function isEntity<
    T extends IEntityMessage<N, D>,
    S extends string = IEntityStates,
    N extends string = string,
    D extends IEntityMessageData = IEntityMessageData,
>(value: unknown): value is IEntity<T, S> {
    return (
        value !== null &&
        typeof value === "object" &&
        SYMBOL_ENTITY_BRAND in value
    );
}

export default function makeEntity<
    T extends IEntityMessage<N, D>,
    S extends string = IEntityStates,
    N extends string = string,
    D extends IEntityMessageData = IEntityMessageData,
>(options: IEntityOptions): IEntity<T, S> {
    const {id, room} = options;

    const EVENT_STATE_UPDATE =
        makeEvent<IEntityStateUpdateEvent<IEntityStates>>();

    let connection: IConnection | null = options.connection;
    let hasDisconnected = false;
    let state: IEntityStates = ENTITY_STATES.connected;

    function _updateState(value: IEntityStates): void {
        const oldState = state;

        state = value;

        EVENT_STATE_UPDATE.dispatch({
            oldState,
            newState: value,
        });
    }

    return {
        [SYMBOL_ENTITY_BRAND]: true,

        id,

        EVENT_STATE_UPDATE: EVENT_STATE_UPDATE as unknown as IEvent<
            IEntityStateUpdateEvent<ExtendLiterals<S, IEntityStates>>
        >,

        get state() {
            return state as ExtendLiterals<S, IEntityStates>;
        },

        _disconnect() {
            if (!connection) {
                throw new EntityConnectionError(
                    `bad dispatch to 'IEntity._disconnect' (the connection to the entity was already closed)`,
                );
            }

            if (!hasDisconnected) {
                hasDisconnected = true;
                connection.abort();
            }
        },

        _dispatch(event) {
            const {data, event: name} = event;

            if (!connection) {
                throw new EntityConnectionError(
                    `bad dispatch to 'IEntity._dispatch' (the connection to the entity is closed)`,
                );
            }

            connection.send({
                event: name,
                data: JSON.stringify(data),
            });
        },

        _dispose() {
            if (state === ENTITY_STATES.disposed) {
                throw new EntityDisposedError(
                    `bad dispatch to 'IEntity._dispose' (the entity was already disposed)`,
                );
            }

            _updateState(ENTITY_STATES.disposed);

            connection = null;

            if (this[SYMBOL_ENTITY_ON_DISPOSE]) {
                this[SYMBOL_ENTITY_ON_DISPOSE]();
            }

            room._entityDisposed(this as unknown as IGenericEntity);
        },
    };
}
