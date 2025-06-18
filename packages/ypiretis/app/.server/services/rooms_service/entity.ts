import type {IEvent} from "../../../utils/event";
import makeEvent from "../../../utils/event";

import type {IWSContext} from "../../utils/web_socket";

import {EntityConnectionError, EntityDisposedError} from "./errors";
import type {
    IEntityMessages,
    IMessage,
    IRoomStateUpdateMessage,
    IRoomTitleUpdateMessage,
    ISelfStateUpdateMessage,
} from "./messages";
import {MESSAGE_EVENTS} from "./messages";
import type {IRoom} from "./room";
import type {IEntityStates} from "./states";
import {ENTITY_STATES} from "./states";
import {
    SYMBOL_ENTITY_BRAND,
    SYMBOL_ENTITY_ON_DISPOSE,
    SYMBOL_ENTITY_ON_STATE_UPDATE,
} from "./symbols";

export type IGenericEntity = IEntity<IEntityMessages, IEntityStates>;

export interface IEntityStateUpdateEvent<S extends string> {
    readonly oldState: S;

    readonly newState: S;
}

export interface IEntityOptions<S extends string> {
    readonly connection: IWSContext;

    readonly id: number;

    readonly room: IRoom;

    readonly state?: S;
}

export interface IEntity<E extends IMessage, S extends string> {
    [SYMBOL_ENTITY_BRAND]: true;

    [SYMBOL_ENTITY_ON_DISPOSE]: () => void;

    [SYMBOL_ENTITY_ON_STATE_UPDATE]: (oldState: S, newState: S) => void;

    readonly EVENT_STATE_UPDATE: IEvent<IEntityStateUpdateEvent<S>>;

    readonly id: number;

    readonly state: S;

    _disconnect(): void;

    _dispatch(event: E): void;

    _dispose(): void;

    _updateState(s: S): void;
}

export function isEntity(value: unknown): value is IGenericEntity {
    return (
        value !== null &&
        typeof value === "object" &&
        SYMBOL_ENTITY_BRAND in value
    );
}

export default function makeEntity<E extends IMessage, S extends string>(
    options: IEntityOptions<S>,
): IEntity<E, S> {
    const {id, room, state: initialState = ENTITY_STATES.connected} = options;

    const EVENT_STATE_UPDATE = makeEvent<IEntityStateUpdateEvent<S>>();

    let connection: IWSContext | null = options.connection;
    let hasDisconnected = false;
    let state = initialState as S;

    const entity = {
        [SYMBOL_ENTITY_BRAND]: true,

        EVENT_STATE_UPDATE,

        id,

        [SYMBOL_ENTITY_ON_DISPOSE]() {
            roomStateUpdateSubscription.dispose();
            roomTitleUpdateSubscription.dispose();
        },

        [SYMBOL_ENTITY_ON_STATE_UPDATE](_oldState, newState) {
            this._dispatch({
                event: MESSAGE_EVENTS.selfStateUpdate,

                data: {
                    state: newState as IEntityStates,
                },
            } satisfies ISelfStateUpdateMessage as unknown as E);
        },

        get state() {
            return state;
        },

        _disconnect() {
            if (connection && !hasDisconnected) {
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

            this._updateState(ENTITY_STATES.disposed as S);

            connection = null;

            if (this[SYMBOL_ENTITY_ON_DISPOSE]) {
                this[SYMBOL_ENTITY_ON_DISPOSE]();
            }

            room[SYMBOL_ENTITY_ON_DISPOSE](this as unknown as IGenericEntity);
        },

        _updateState(value) {
            const oldState = state;

            state = value;

            EVENT_STATE_UPDATE.dispatch({
                oldState,
                newState: value,
            });

            room[SYMBOL_ENTITY_ON_STATE_UPDATE](
                this as unknown as IGenericEntity,
                oldState as IEntityStates,
                value as IEntityStates,
            );
        },
    } satisfies IEntity<E, S>;

    const roomStateUpdateSubscription = room.EVENT_STATE_UPDATE.subscribe(
        (event) => {
            if (entity.state !== ENTITY_STATES.connected) {
                return;
            }

            const {newState} = event;

            entity._dispatch({
                event: MESSAGE_EVENTS.roomStateUpdate,

                data: {
                    state: newState,
                },
            } satisfies IRoomStateUpdateMessage as unknown as E);
        },
    );

    const roomTitleUpdateSubscription = room.EVENT_TITLE_UPDATE.subscribe(
        (event) => {
            if (entity.state !== ENTITY_STATES.connected) {
                return;
            }

            const {newTitle} = event;

            entity._dispatch({
                event: MESSAGE_EVENTS.roomTitleUpdate,

                data: {
                    title: newTitle,
                },
            } satisfies IRoomTitleUpdateMessage as unknown as E);
        },
    );

    entity._dispatch({
        event: MESSAGE_EVENTS.selfStateUpdate,

        data: {
            state: state as IEntityStates,
        },
    } satisfies ISelfStateUpdateMessage as unknown as E);

    return entity;
}
