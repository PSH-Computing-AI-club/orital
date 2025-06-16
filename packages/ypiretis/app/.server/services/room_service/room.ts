import {makeIDPool} from "../../utils/id_pool";
import type {IEvent} from "../../../utils/event";
import makeEvent from "../../../utils/event";
import type {IWSContext} from "../../utils/web_socket";

import {IUser} from "../users_service";

import type {IAttendeeUser} from "./attendee_user";
import makeAttendeeUser, {isAttendeeUser} from "./attendee_user";
import type {IDisplayEntity} from "./display_entity";
import makeDisplayEntity, {isDisplayEntity} from "./display_entity";
import type {IGenericEntity} from "./entity";
import {ENTITY_STATES, InvalidEntityTypeError} from "./entity";
import type {IPresenterUser} from "./presenter_user";
import makePresenterUser, {
    PRESENTER_ENTITY_ID,
    isPresenterUser,
} from "./presenter_user";

export const ROOM_STATES = {
    disposed: "STATE_DISPOSED",

    locked: "STATE_LOCKED",

    permissive: "STATE_PERMISSIVE",

    unlocked: "STATE_UNLOCKED",
} as const;

export type IRoomStates = (typeof ROOM_STATES)[keyof typeof ROOM_STATES];

export interface IRoomEntityAddedEvent {
    readonly entity: IGenericEntity;
}

export interface IRoomEntityDisposedEvent {
    readonly entity: IGenericEntity;
}

export interface IRoomPINUpdateEvent {
    readonly oldPIN: string;

    readonly newPIN: string;
}

export interface IRoomStateUpdateEvent {
    readonly oldState: IRoomStates;

    readonly newState: IRoomStates;
}

export interface IRoomTitleUpdateEvent {
    readonly oldTitle: string;

    readonly newTitle: string;
}

export interface IRoomOptions {
    readonly id: number;

    readonly pin: string;

    readonly presenter: IUser;

    readonly roomID: string;

    readonly state: IRoomStates;

    readonly title: string;
}

export interface IRoom {
    readonly EVENT_ENTITY_ADDED: IEvent<IRoomEntityAddedEvent>;

    readonly EVENT_ENTITY_DISPOSED: IEvent<IRoomEntityDisposedEvent>;

    readonly EVENT_PIN_UPDATE: IEvent<IRoomPINUpdateEvent>;

    readonly EVENT_STATE_UPDATE: IEvent<IRoomStateUpdateEvent>;

    readonly EVENT_TITLE_UPDATE: IEvent<IRoomTitleUpdateEvent>;

    readonly approvedAccountIDs: ReadonlySet<string>;

    readonly attendees: ReadonlyMap<number, IAttendeeUser>;

    readonly bannedAccountIDs: ReadonlySet<string>;

    readonly displays: ReadonlyMap<number, IDisplayEntity>;

    readonly id: number;

    readonly pin: string;

    readonly presenter: IUser;

    readonly presenterEntity: IPresenterUser | null;

    readonly roomID: string;

    readonly title: string;

    readonly state: IRoomStates;

    _attendeeApproved(attendee: IAttendeeUser): void;

    _attendeeBanned(attendee: IAttendeeUser): void;

    _attendeeKicked(attendee: IAttendeeUser): void;

    _entityDisposed(entity: IGenericEntity): void;

    addAttendee(connection: IWSContext, user: IUser): IAttendeeUser;

    addDisplay(connection: IWSContext): IDisplayEntity;

    addPresenter(connection: IWSContext): IPresenterUser;

    dispose(): void;

    updatePIN(value: string): string;

    updateState(
        state: Exclude<IRoomStates, (typeof ROOM_STATES)["disposed"]>,
    ): void;

    updateTitle(title: string): void;
}

export class RoomDisposedError extends Error {
    constructor(message: string, options?: ErrorOptions) {
        super(message, options);

        this.name = RoomDisposedError.name;
    }
}

export default function makeRoom(options: IRoomOptions): IRoom {
    const {id, roomID, presenter} = options;
    let {pin, state, title} = options;

    let presenterEntity: IPresenterUser | null = null;

    const EVENT_ENTITY_ADDED = makeEvent<IRoomEntityAddedEvent>();
    const EVENT_ENTITY_DISPOSED = makeEvent<IRoomEntityDisposedEvent>();

    const EVENT_PIN_UPDATE = makeEvent<IRoomPINUpdateEvent>();
    const EVENT_STATE_UPDATE = makeEvent<IRoomStateUpdateEvent>();
    const EVENT_TITLE_UPDATE = makeEvent<IRoomTitleUpdateEvent>();

    const approvedAccountIDs = new Set<string>();
    const bannedAccountIDs = new Set<string>();

    const attendees = new Map<number, IAttendeeUser>();
    const attendeePool = makeIDPool();

    const displays = new Map<number, IDisplayEntity>();
    const displayPool = makeIDPool();

    function _updateState(value: IRoomStates): void {
        const oldState = state;

        state = value;

        EVENT_STATE_UPDATE.dispatch({
            oldState,
            newState: value,
        });
    }

    return {
        EVENT_ENTITY_ADDED,
        EVENT_ENTITY_DISPOSED,

        EVENT_PIN_UPDATE,
        EVENT_STATE_UPDATE,
        EVENT_TITLE_UPDATE,

        approvedAccountIDs,
        attendees,
        bannedAccountIDs,
        displays,
        id,
        presenter,
        roomID,

        get pin() {
            return pin;
        },

        get presenterEntity() {
            return presenterEntity;
        },

        get state() {
            return state;
        },

        get title() {
            return title;
        },

        _attendeeApproved(attendee) {
            const {user} = attendee;
            const {accountID} = user;

            approvedAccountIDs.add(accountID);
        },

        _attendeeBanned(attendee) {
            const {user} = attendee;
            const {accountID} = user;

            approvedAccountIDs.delete(accountID);
            bannedAccountIDs.add(accountID);
        },

        _attendeeKicked(attendee) {
            const {user} = attendee;
            const {accountID} = user;

            approvedAccountIDs.delete(accountID);
        },

        _entityDisposed(entity) {
            if (isAttendeeUser(entity)) {
                const {id} = entity;

                attendeePool.releaseID(id);
                attendees.delete(id);

                EVENT_ENTITY_DISPOSED.dispatch({
                    entity,
                });
            } else if (isDisplayEntity(entity)) {
                const {id} = entity;

                displayPool.releaseID(id);
                displays.delete(id);

                EVENT_ENTITY_DISPOSED.dispatch({
                    entity,
                });
            } else if (isPresenterUser(entity)) {
                EVENT_ENTITY_DISPOSED.dispatch({
                    entity,
                });

                presenterEntity = null;
            } else {
                throw new InvalidEntityTypeError(
                    "bad argument #0 to 'IRoom._entityDisposed' (entity is not a recognized entity type)",
                );
            }
        },

        addAttendee(connection, user) {
            if (state === ROOM_STATES.disposed) {
                throw new RoomDisposedError(
                    `bad dispatch to 'IRoom.addAttendee' (room '${pin}' was previously disposed)`,
                );
            }

            const id = attendeePool.generateID();

            const attendee = makeAttendeeUser({
                connection,
                id,
                user,

                room: this,
            });

            attendees.set(id, attendee);

            EVENT_ENTITY_ADDED.dispatch({
                entity: attendee as unknown as IGenericEntity,
            });

            return attendee;
        },

        addDisplay(connection) {
            if (state === ROOM_STATES.disposed) {
                throw new RoomDisposedError(
                    `bad dispatch to 'IRoom.addDisplay' (room '${pin}' was previously disposed)`,
                );
            }

            const id = displayPool.generateID();

            const display = makeDisplayEntity({
                connection,
                id,

                room: this,
            });

            displays.set(id, display);

            EVENT_ENTITY_ADDED.dispatch({
                entity: display as unknown as IGenericEntity,
            });

            return display;
        },

        addPresenter(connection) {
            presenterEntity = makePresenterUser({
                connection,

                // **NOTE**: There can only be one presenter connection at
                // a time. So, we will just make it static.
                id: PRESENTER_ENTITY_ID,
                room: this,
                user: presenter,
            });

            EVENT_ENTITY_ADDED.dispatch({
                entity: presenterEntity as unknown as IGenericEntity,
            });

            return presenterEntity;
        },

        dispose() {
            if (state === ROOM_STATES.disposed) {
                throw new RoomDisposedError(
                    `bad dispatch to 'IRoom.dispose' (room '${pin}' was previously disposed)`,
                );
            }

            for (const attendee of attendees.values()) {
                const {state} = attendee;

                if (state !== ENTITY_STATES.disposed) {
                    attendee._disconnect();
                }
            }

            for (const display of displays.values()) {
                const {state} = display;

                if (state !== ENTITY_STATES.disposed) {
                    display._disconnect();
                }
            }

            if (
                presenterEntity !== null &&
                presenterEntity.state !== ENTITY_STATES.disposed
            ) {
                presenterEntity._disconnect();
            }

            _updateState(ROOM_STATES.disposed);
        },

        updatePIN(value) {
            if (state === ROOM_STATES.disposed) {
                throw new RoomDisposedError(
                    `bad dispatch to 'IRoom.updatePIN' (room '${pin}' was previously disposed)`,
                );
            }

            const oldPIN = pin;
            pin = value;

            EVENT_PIN_UPDATE.dispatch({
                oldPIN,
                newPIN: pin,
            });

            return pin;
        },

        updateState(value) {
            if (state === ROOM_STATES.disposed) {
                throw new RoomDisposedError(
                    `bad dispatch to 'IRoom.updateState' (room '${pin}' was previously disposed)`,
                );
            }

            _updateState(value);
        },

        updateTitle(value) {
            if (state === ROOM_STATES.disposed) {
                throw new RoomDisposedError(
                    `bad dispatch to 'IRoom.updateTitle' (room '${pin}' was previously disposed)`,
                );
            }

            const oldTitle = title;
            title = value;

            EVENT_TITLE_UPDATE.dispatch({
                oldTitle,
                newTitle: value,
            });
        },
    };
}
