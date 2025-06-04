import type {IEvent} from "../../../utils/event";
import makeEvent from "../../../utils/event";
import type {IConnection} from "../../utils/event_stream";
import {generatePIN} from "../../utils/crypto";

import {IUser} from "../users_service";

import type {IAttendeeUser} from "./attendee_user";
import makeAttendeeUser, {isAttendeeUser} from "./attendee_user";
import type {IDisplayEntity} from "./display_entity";
import makeDisplayEntity, {isDisplayEntity} from "./display_entity";
import type {IGenericEntity} from "./entity";
import {ENTITY_STATES, InvalidEntityTypeError} from "./entity";
import type {IPresenterUser} from "./presenter_user";
import makePresenterUser, {isPresenterUser} from "./presenter_user";

let idCounter = -1;

export const ROOM_STATES = {
    disposed: "STATE_DISPOSED",

    open: "STATE_OPEN",

    permissive: "STATE_PERMISSIVE",

    staging: "STATE_STAGING",
} as const;

export type IRoomStates = (typeof ROOM_STATES)[keyof typeof ROOM_STATES];

export interface IRoomAttendeeAddedEvent {
    readonly attendee: IAttendeeUser;
}

export interface IRoomAttendeeDisposedEvent {
    readonly attendee: IAttendeeUser;
}

export interface IRoomDisplayAddedEvent {
    readonly display: IDisplayEntity;
}

export interface IRoomDisplayDisposedEvent {
    readonly display: IDisplayEntity;
}

export interface IRoomPresenterDisposedEvent {
    readonly presenter: IPresenterUser;
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
    readonly presenter: IUser;

    readonly presenterConnection: IConnection;

    readonly state?: IRoomStates;

    readonly title?: string;
}

export interface IRoom {
    readonly EVENT_ATTENDEE_ADDED: IEvent<IRoomAttendeeAddedEvent>;

    readonly EVENT_ATTENDEE_DISPOSED: IEvent<IRoomAttendeeDisposedEvent>;

    readonly EVENT_DISPLAY_ADDED: IEvent<IRoomDisplayAddedEvent>;

    readonly EVENT_DISPLAY_DISPOSED: IEvent<IRoomDisplayDisposedEvent>;

    readonly EVENT_PRESENTER_DISPOSED: IEvent<IRoomPresenterDisposedEvent>;

    readonly EVENT_PIN_UPDATE: IEvent<IRoomPINUpdateEvent>;

    readonly EVENT_STATE_UPDATE: IEvent<IRoomStateUpdateEvent>;

    readonly EVENT_TITLE_UPDATE: IEvent<IRoomTitleUpdateEvent>;

    readonly attendees: ReadonlySet<IAttendeeUser>;

    readonly displays: ReadonlySet<IDisplayEntity>;

    readonly id: number;

    readonly pin: string;

    readonly presenter: IPresenterUser;

    readonly title: string;

    readonly state: IRoomStates;

    _entityDisposed(entity: IGenericEntity): void;

    addAttendee(connection: IConnection, user: IUser): void;

    addDisplay(connection: IConnection): void;

    dispose(): void;

    updatePIN(): string;

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
    const {presenter: presenterUser, presenterConnection} = options;
    let {state = ROOM_STATES.staging, title = "A Presentation Room"} = options;

    let presenter: IPresenterUser;

    // **TODO:** Pull from options object when DB integration is ready
    const id = ++idCounter;
    let pin = generatePIN();

    const EVENT_ATTENDEE_ADDED = makeEvent<IRoomAttendeeAddedEvent>();
    const EVENT_ATTENDEE_DISPOSED = makeEvent<IRoomAttendeeDisposedEvent>();
    const EVENT_DISPLAY_ADDED = makeEvent<IRoomDisplayAddedEvent>();
    const EVENT_DISPLAY_DISPOSED = makeEvent<IRoomDisplayDisposedEvent>();
    const EVENT_PRESENTER_DISPOSED = makeEvent<IRoomPresenterDisposedEvent>();

    const EVENT_PIN_UPDATE = makeEvent<IRoomPINUpdateEvent>();
    const EVENT_STATE_UPDATE = makeEvent<IRoomStateUpdateEvent>();
    const EVENT_TITLE_UPDATE = makeEvent<IRoomTitleUpdateEvent>();

    const attendees = new Set<IAttendeeUser>();
    const displays = new Set<IDisplayEntity>();

    function _updateState(value: IRoomStates): void {
        const oldState = state;

        state = value;

        EVENT_STATE_UPDATE.dispatch({
            oldState,
            newState: value,
        });
    }

    const room = {
        EVENT_ATTENDEE_ADDED,
        EVENT_ATTENDEE_DISPOSED,
        EVENT_DISPLAY_ADDED,
        EVENT_DISPLAY_DISPOSED,
        EVENT_PRESENTER_DISPOSED,
        EVENT_PIN_UPDATE,
        EVENT_STATE_UPDATE,
        EVENT_TITLE_UPDATE,

        attendees,
        displays,
        id,

        get pin() {
            return pin;
        },

        get presenter() {
            return presenter;
        },

        get state() {
            return state;
        },

        get title() {
            return title;
        },

        _entityDisposed(entity) {
            if (isAttendeeUser(entity)) {
                attendees.delete(entity);

                EVENT_ATTENDEE_DISPOSED.dispatch({
                    attendee: entity,
                });
            } else if (isDisplayEntity(entity)) {
                displays.delete(entity);

                EVENT_DISPLAY_DISPOSED.dispatch({
                    display: entity,
                });
            } else if (isPresenterUser(entity)) {
                EVENT_PRESENTER_DISPOSED.dispatch({
                    presenter: entity,
                });

                this.dispose();
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

            const attendee = makeAttendeeUser({
                connection,
                user,

                room: this,
            });

            attendees.add(attendee);

            EVENT_ATTENDEE_ADDED.dispatch({
                attendee,
            });
        },

        addDisplay(connection) {
            if (state === ROOM_STATES.disposed) {
                throw new RoomDisposedError(
                    `bad dispatch to 'IRoom.addDisplay' (room '${pin}' was previously disposed)`,
                );
            }

            const display = makeDisplayEntity({
                connection,

                room: this,
            });

            displays.add(display);

            EVENT_DISPLAY_ADDED.dispatch({
                display,
            });
        },

        dispose() {
            if (state === ROOM_STATES.disposed) {
                throw new RoomDisposedError(
                    `bad dispatch to 'IRoom.dispose' (room '${pin}' was previously disposed)`,
                );
            }

            for (const attendee of attendees) {
                const {state} = attendee;

                if (state !== ENTITY_STATES.disposed) {
                    attendee._disconnect();
                }
            }

            for (const display of displays) {
                const {state} = display;

                if (state !== ENTITY_STATES.disposed) {
                    display._disconnect();
                }
            }

            if (presenter.state !== ENTITY_STATES.disposed) {
                presenter._disconnect();
            }

            _updateState(ROOM_STATES.disposed);
        },

        updatePIN() {
            if (state === ROOM_STATES.disposed) {
                throw new RoomDisposedError(
                    `bad dispatch to 'IRoom.updatePIN' (room '${pin}' was previously disposed)`,
                );
            }

            const oldPIN = pin;
            pin = generatePIN();

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
    } satisfies IRoom;

    presenter = makePresenterUser({
        room,

        connection: presenterConnection,
        user: presenterUser,
    });

    return room;
}
