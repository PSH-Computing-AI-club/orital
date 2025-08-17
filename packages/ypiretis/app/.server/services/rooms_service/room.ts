import {Temporal} from "@js-temporal/polyfill";

import type {IWSContext} from "../../state/web_socket";

import type {IEvent} from "../../../utils/event";
import makeEvent from "../../../utils/event";
import {makeIDPool} from "../../utils/id_pool";

import {IUser} from "../users_service";

import type {IAttendeeUser} from "./attendee_user";
import makeAttendeeUser, {isAttendeeUser} from "./attendee_user";
import type {IDisconnectedAttendeeUser} from "./disconnected_attendee_user";
import type {IDisplayEntity} from "./display_entity";
import makeDisplayEntity, {isDisplayEntity} from "./display_entity";
import type {IGenericEntity} from "./entity";
import {InvalidEntityTypeError, RoomStateError} from "./errors";
import type {IPresenterUser} from "./presenter_user";
import makePresenterUser, {
    PRESENTER_ENTITY_ID,
    isPresenterUser,
} from "./presenter_user";
import type {IEntityStates, IRoomStates} from "./states";
import {ENTITY_STATES, ROOM_STATES} from "./states";
import {
    SYMBOL_ATTENDEE_USER_ON_APPROVED,
    SYMBOL_ATTENDEE_USER_ON_BANNED,
    SYMBOL_ATTENDEE_USER_ON_HAND,
    SYMBOL_ATTENDEE_USER_ON_KICKED,
    SYMBOL_ENTITY_ON_DISPOSE,
    SYMBOL_ENTITY_ON_STATE_UPDATE,
} from "./symbols";

export interface IAttendeeApproved {
    readonly attendee: IAttendeeUser;
}

export interface IAttendeeBanned {
    readonly attendee: IAttendeeUser;
}

export interface IAttendeeHandUpdate {
    readonly attendee: IAttendeeUser;

    readonly isRaisingHand: boolean;
}

export interface IAttendeeKicked {
    readonly attendee: IAttendeeUser;
}

export interface IEntityAddedEvent {
    readonly entity: IGenericEntity;
}

export interface IEntityDisposedEvent {
    readonly entity: IGenericEntity;
}

export interface IEntityStateUpdateEvent {
    readonly entity: IGenericEntity;

    readonly newState: IEntityStates;

    readonly oldState: IEntityStates;
}

export interface IRoomPINUpdateEvent {
    readonly newPIN: string;

    readonly oldPIN: string;
}

export interface IRoomStateUpdateEvent {
    readonly newState: IRoomStates;

    readonly oldState: IRoomStates;
}

export interface IRoomTitleUpdateEvent {
    readonly newTitle: string;

    readonly oldTitle: string;
}

export interface IRoomOptions {
    readonly createdAt: Temporal.Instant;

    readonly id: number;

    readonly pin: string;

    readonly presenter: IUser;

    readonly roomID: string;

    readonly state: IRoomStates;

    readonly title: string;
}

export interface IRoom {
    [SYMBOL_ATTENDEE_USER_ON_APPROVED](attendee: IAttendeeUser): void;

    [SYMBOL_ATTENDEE_USER_ON_BANNED](attendee: IAttendeeUser): void;

    [SYMBOL_ATTENDEE_USER_ON_HAND](
        attendee: IAttendeeUser,
        isRaisingHand: boolean,
    ): void;

    [SYMBOL_ATTENDEE_USER_ON_KICKED](attendee: IAttendeeUser): void;

    [SYMBOL_ENTITY_ON_DISPOSE](entity: IGenericEntity): void;

    [SYMBOL_ENTITY_ON_STATE_UPDATE](
        entity: IGenericEntity,
        oldState: IEntityStates,
        newState: IEntityStates,
    ): void;

    readonly EVENT_ATTENDEE_APPROVED: IEvent<IAttendeeApproved>;

    readonly EVENT_ATTENDEE_BANNED: IEvent<IAttendeeBanned>;

    readonly EVENT_ATTENDEE_HAND_UPDATE: IEvent<IAttendeeHandUpdate>;

    readonly EVENT_ATTENDEE_KICKED: IEvent<IAttendeeKicked>;

    readonly EVENT_ENTITY_ADDED: IEvent<IEntityAddedEvent>;

    readonly EVENT_ENTITY_DISPOSED: IEvent<IEntityDisposedEvent>;

    readonly EVENT_ENTITY_STATE_UPDATE: IEvent<IEntityStateUpdateEvent>;

    readonly EVENT_PIN_UPDATE: IEvent<IRoomPINUpdateEvent>;

    readonly EVENT_STATE_UPDATE: IEvent<IRoomStateUpdateEvent>;

    readonly EVENT_TITLE_UPDATE: IEvent<IRoomTitleUpdateEvent>;

    readonly approvedAccountIDs: ReadonlySet<string>;

    readonly attendees: ReadonlyMap<number, IAttendeeUser>;

    readonly bannedAccountIDs: ReadonlySet<string>;

    readonly createdAt: Temporal.Instant;

    readonly disconnectedAttendees: ReadonlyMap<
        string,
        IDisconnectedAttendeeUser
    >;

    readonly displays: ReadonlyMap<number, IDisplayEntity>;

    readonly id: number;

    readonly pin: string;

    readonly presenter: IUser;

    readonly presenterEntity: IPresenterUser | null;

    readonly presenterLastDisposed: Temporal.Instant;

    readonly roomID: string;

    readonly title: string;

    readonly state: IRoomStates;

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

export default function makeRoom(options: IRoomOptions): IRoom {
    const {createdAt, id, roomID, presenter} = options;
    let {pin, state, title} = options;

    const EVENT_ATTENDEE_APPROVED = makeEvent<IAttendeeApproved>();
    const EVENT_ATTENDEE_BANNED = makeEvent<IAttendeeBanned>();
    const EVENT_ATTENDEE_HAND_UPDATE = makeEvent<IAttendeeHandUpdate>();
    const EVENT_ATTENDEE_KICKED = makeEvent<IAttendeeKicked>();

    const EVENT_ENTITY_ADDED = makeEvent<IEntityAddedEvent>();
    const EVENT_ENTITY_DISPOSED = makeEvent<IEntityDisposedEvent>();
    const EVENT_ENTITY_STATE_UPDATE = makeEvent<IEntityStateUpdateEvent>();

    const EVENT_PIN_UPDATE = makeEvent<IRoomPINUpdateEvent>();
    const EVENT_STATE_UPDATE = makeEvent<IRoomStateUpdateEvent>();
    const EVENT_TITLE_UPDATE = makeEvent<IRoomTitleUpdateEvent>();

    const approvedAccountIDs = new Set<string>();
    const bannedAccountIDs = new Set<string>();

    const attendees = new Map<number, IAttendeeUser>();
    const attendeePool = makeIDPool();
    const disconnectedAttendees = new Map<string, IDisconnectedAttendeeUser>();

    const displays = new Map<number, IDisplayEntity>();
    const displayPool = makeIDPool();

    let presenterEntity: IPresenterUser | null = null;
    // **NOTE:** When a room is created the presenter is not necessarily
    // connected yet, or will.
    let presenterLastDisposed: Temporal.Instant = createdAt;

    function _updateState(value: IRoomStates): void {
        const oldState = state;

        state = value;

        EVENT_STATE_UPDATE.dispatch({
            oldState,
            newState: value,
        });
    }

    return {
        get EVENT_ATTENDEE_APPROVED() {
            return EVENT_ATTENDEE_APPROVED;
        },

        get EVENT_ATTENDEE_BANNED() {
            return EVENT_ATTENDEE_BANNED;
        },

        get EVENT_ATTENDEE_HAND_UPDATE() {
            return EVENT_ATTENDEE_HAND_UPDATE;
        },

        get EVENT_ATTENDEE_KICKED() {
            return EVENT_ATTENDEE_KICKED;
        },

        get EVENT_ENTITY_ADDED() {
            return EVENT_ENTITY_ADDED;
        },

        get EVENT_ENTITY_DISPOSED() {
            return EVENT_ENTITY_DISPOSED;
        },

        get EVENT_ENTITY_STATE_UPDATE() {
            return EVENT_ENTITY_STATE_UPDATE;
        },

        get EVENT_PIN_UPDATE() {
            return EVENT_PIN_UPDATE;
        },

        get EVENT_STATE_UPDATE() {
            return EVENT_STATE_UPDATE;
        },

        get EVENT_TITLE_UPDATE() {
            return EVENT_TITLE_UPDATE;
        },

        get approvedAccountIDs() {
            return approvedAccountIDs;
        },

        get attendees() {
            return attendees;
        },

        get bannedAccountIDs() {
            return bannedAccountIDs;
        },

        get createdAt() {
            return createdAt;
        },

        get disconnectedAttendees() {
            return disconnectedAttendees;
        },

        get displays() {
            return displays;
        },

        get id() {
            return id;
        },

        get pin() {
            return pin;
        },

        get presenter() {
            return presenter;
        },

        get presenterEntity() {
            return presenterEntity;
        },

        get presenterLastDisposed() {
            return presenterLastDisposed;
        },

        get roomID() {
            return roomID;
        },

        get state() {
            return state;
        },

        get title() {
            return title;
        },

        [SYMBOL_ATTENDEE_USER_ON_APPROVED](attendee) {
            const {user} = attendee;
            const {accountID} = user;

            approvedAccountIDs.add(accountID);

            EVENT_ATTENDEE_APPROVED.dispatch({
                attendee,
            });
        },

        [SYMBOL_ATTENDEE_USER_ON_BANNED](attendee) {
            const {user} = attendee;
            const {accountID} = user;

            approvedAccountIDs.delete(accountID);
            bannedAccountIDs.add(accountID);

            EVENT_ATTENDEE_BANNED.dispatch({
                attendee,
            });
        },

        [SYMBOL_ATTENDEE_USER_ON_HAND](attendee, isRaisingHand) {
            EVENT_ATTENDEE_HAND_UPDATE.dispatch({
                attendee,
                isRaisingHand,
            });
        },

        [SYMBOL_ATTENDEE_USER_ON_KICKED](attendee) {
            const {user} = attendee;
            const {accountID} = user;

            approvedAccountIDs.delete(accountID);

            EVENT_ATTENDEE_KICKED.dispatch({
                attendee,
            });
        },

        [SYMBOL_ENTITY_ON_DISPOSE](entity) {
            if (isAttendeeUser(entity)) {
                const {id, user} = entity;
                const {accountID, firstName, lastName} = user;

                attendeePool.releaseID(id);
                attendees.delete(id);

                if (
                    state === ROOM_STATES.unlocked ||
                    approvedAccountIDs.has(accountID)
                ) {
                    disconnectedAttendees.set(accountID, {
                        accountID,
                        firstName,
                        lastName,
                    });
                }

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

        [SYMBOL_ENTITY_ON_STATE_UPDATE](entity, oldState, newState) {
            EVENT_ENTITY_STATE_UPDATE.dispatch({
                entity,
                newState,
                oldState,
            });
        },

        addAttendee(connection, user) {
            if (state === ROOM_STATES.disposed) {
                throw new RoomStateError(
                    `bad dispatch to 'IRoom.addAttendee' (room '${roomID}' was previously disposed)`,
                );
            }

            const {accountID} = user;

            const id = attendeePool.generateID();
            const attendee = makeAttendeeUser({
                connection,
                id,
                user,

                room: this,
            });

            attendees.set(id, attendee);
            disconnectedAttendees.delete(accountID);

            EVENT_ENTITY_ADDED.dispatch({
                entity: attendee as unknown as IGenericEntity,
            });

            return attendee;
        },

        addDisplay(connection) {
            if (state === ROOM_STATES.disposed) {
                throw new RoomStateError(
                    `bad dispatch to 'IRoom.addDisplay' (room '${roomID}' was previously disposed)`,
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
                throw new RoomStateError(
                    `bad dispatch to 'IRoom.dispose' (room '${roomID}' was previously disposed)`,
                );
            }

            _updateState(ROOM_STATES.disposed);

            // **HACK:** We need to delay this an event pump cycle so that the
            // connected clients can be updated on room state before their connections
            // are terminated.

            setTimeout(() => {
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
                    presenterLastDisposed = Temporal.Now.instant();

                    presenterEntity._disconnect();
                }
            }, 0);
        },

        updatePIN(value) {
            if (state === ROOM_STATES.disposed) {
                throw new RoomStateError(
                    `bad dispatch to 'IRoom.updatePIN' (room '${roomID}' was previously disposed)`,
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
                throw new RoomStateError(
                    `bad dispatch to 'IRoom.updateState' (room '${roomID}' was previously disposed)`,
                );
            }

            _updateState(value);
        },

        updateTitle(value) {
            if (state === ROOM_STATES.disposed) {
                throw new RoomStateError(
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
