import type {IEvent} from "../../../utils/event";
import makeEvent from "../../../utils/event";

import type {ExtendLiterals} from "../../utils/types";
import type {IWSContext} from "../../utils/web_socket";

import type {
    IEntityMessage,
    IEntityMessageData,
    IRoomStateUpdateMessage,
    IRoomTitleUpdateMessage,
} from "./messages";
import type {IRoom} from "./room";

const SYMBOL_ENTITY_BRAND: unique symbol = Symbol();

export const SYMBOL_ENTITY_ON_DISPOSE: unique symbol = Symbol();

export const ENTITY_STATES = {
    connected: "STATE_CONNECTED",

    disposed: "STATE_DISPOSED",
} as const;

export type IEntityStates = (typeof ENTITY_STATES)[keyof typeof ENTITY_STATES];

export type IEntityMessages = IRoomStateUpdateMessage | IRoomTitleUpdateMessage;

export type IGenericEntity = IEntity<IEntityMessages, IEntityStates>;

export interface IEntityStateUpdateEvent<S extends string> {
    readonly oldState: ExtendLiterals<S, IEntityStates>;

    readonly newState: ExtendLiterals<S, IEntityStates>;
}

export interface IEntityOptions {
    readonly connection: IWSContext;

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

    [SYMBOL_ENTITY_ON_DISPOSE]: () => void;

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
    E extends IEntity<T, S, N, D> = IEntity<T, S, N, D>,
>(options: IEntityOptions): E {
    const {id, room} = options;

    const EVENT_STATE_UPDATE =
        makeEvent<IEntityStateUpdateEvent<IEntityStates>>();

    let connection: IWSContext | null = options.connection;
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

    const entity = {
        [SYMBOL_ENTITY_BRAND]: true,

        [SYMBOL_ENTITY_ON_DISPOSE]() {
            stateUpdateSubscription.dispose();
            titleUpdateSubscription.dispose();
        },

        EVENT_STATE_UPDATE,

        id,

        get state() {
            return state;
        },

        _disconnect() {
            if (!connection) {
                throw new EntityConnectionError(
                    `bad dispatch to 'IEntity._disconnect' (the connection to the entity was already closed)`,
                );
            }

            if (!hasDisconnected) {
                hasDisconnected = true;
                connection.close();
            }
        },

        _dispatch(event) {
            const {data, event: name} = event;

            if (!connection) {
                throw new EntityConnectionError(
                    `bad dispatch to 'IEntity._dispatch' (the connection to the entity is closed)`,
                );
            }

            connection.send(
                JSON.stringify({
                    event: name,
                    data: data,
                }),
            );
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
    } satisfies IGenericEntity;

    const stateUpdateSubscription = room.EVENT_STATE_UPDATE.subscribe(
        (event) => {
            const {newState} = event;

            entity._dispatch({
                event: "room.stateUpdate",

                data: {
                    state: newState,
                },
            });
        },
    );

    const titleUpdateSubscription = room.EVENT_TITLE_UPDATE.subscribe(
        (event) => {
            const {newTitle} = event;

            entity._dispatch({
                event: "room.titleUpdate",

                data: {
                    title: newTitle,
                },
            });
        },
    );

    return entity as unknown as E;
}
