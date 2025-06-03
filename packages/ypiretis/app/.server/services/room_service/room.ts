import type {IEvent} from "../../../utils/event";
import makeEvent from "../../../utils/event";

import {generatePIN} from "../../utils/crypto";

import type {IAttendeeUser} from "./attendee_user";
import {isAttendeeUser} from "./attendee_user";
import type {IDisplayEntity} from "./display_entity";
import {isDisplayEntity} from "./display_entity";
import type {IGenericEntity} from "./entity";
import {ENTITY_STATES, InvalidEntityTypeError} from "./entity";
import type {IPresenterUser} from "./presenter_user";
import {isPresenterUser} from "./presenter_user";

export const ROOM_STATES = {
    disposed: "STATE_DISPOSED",

    open: "STATE_OPEN",

    permissive: "STATE_PERMISSIVE",

    staging: "STATE_STAGING",
} as const;

export type IRoomStates = (typeof ROOM_STATES)[keyof typeof ROOM_STATES];

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
    readonly presenter: IPresenterUser;

    readonly state?: IRoomStates;

    readonly title: string;
}

export interface IRoom {
    readonly EVENT_PIN_UPDATE: IEvent<IRoomPINUpdateEvent>;

    readonly EVENT_STATE_UPDATE: IEvent<IRoomStateUpdateEvent>;

    readonly EVENT_TITLE_UPDATE: IEvent<IRoomTitleUpdateEvent>;

    attendees: Set<IAttendeeUser>;

    displays: Set<IDisplayEntity>;

    readonly pin: string;

    readonly presenter: IPresenterUser;

    readonly title: string;

    readonly state: IRoomStates;

    _entityDisposed(entity: IGenericEntity): void;

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
    const {presenter} = options;
    let {state = ROOM_STATES.staging, title} = options;

    let pin = generatePIN();

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

    return {
        EVENT_PIN_UPDATE,
        EVENT_STATE_UPDATE,
        EVENT_TITLE_UPDATE,

        attendees,
        displays,

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
            } else if (isDisplayEntity(entity)) {
                displays.delete(entity);
            } else if (isPresenterUser(entity)) {
                this.dispose();
            } else {
                throw new InvalidEntityTypeError(
                    "bad argument #0 to 'IRoom._entityDisposed' (entity is not a recognized entity type)",
                );
            }
        },

        dispose() {
            for (const attendee of attendees) {
                const {state} = attendee;

                if (state === ENTITY_STATES.connected) {
                }
            }

            _updateState(ROOM_STATES.disposed);
        },

        updatePIN() {
            if (state === ROOM_STATES.disposed) {
                throw new RoomDisposedError(
                    `bad dispatch to 'IRoom.updatePIN' (room '${pin}' was previously disposed.)`,
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
                    `bad dispatch to 'IRoom.updateState' (room '${pin}' was previously disposed.)`,
                );
            }

            _updateState(value);
        },

        updateTitle(value) {
            if (state === ROOM_STATES.disposed) {
                throw new RoomDisposedError(
                    `bad dispatch to 'IRoom.updateTitle' (room '${pin}' was previously disposed.)`,
                );
            }

            const oldTitle = value;
            title = value;

            EVENT_TITLE_UPDATE.dispatch({
                oldTitle,
                newTitle: value,
            });
        },
    };
}
