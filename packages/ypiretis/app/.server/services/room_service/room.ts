import {generatePIN} from "../../utils/crypto";

import type {IAttendeeUser} from "./attendee_user";
import {isAttendeeUser} from "./attendee_user";
import type {IDisplayEntity} from "./display_entity";
import {isDisplayEntity} from "./display_entity";
import type {IGenericEntity} from "./entity";
import {InvalidEntityTypeError} from "./entity";
import type {IPresenterUser} from "./presenter_user";
import {isPresenterUser} from "./presenter_user";

export const ROOM_STATES = {
    disposed: "STATE_DISPOSED",

    open: "STATE_OPEN",

    permissive: "STATE_PERMISSIVE",

    staging: "STATE_STAGING",
} as const;

export type IRoomStates = (typeof ROOM_STATES)[keyof typeof ROOM_STATES];

export interface IRoom {
    attendees: Set<IAttendeeUser>;

    displays: Set<IDisplayEntity>;

    readonly pin: string;

    readonly presenter: IPresenterUser;

    readonly title: string;

    readonly state: IRoomStates;

    _entityDisposed(entity: IGenericEntity): void;

    dispose(): void;

    updatePIN(): Promise<string>;

    updateState(
        state: Exclude<IRoomStates, (typeof ROOM_STATES)["disposed"]>,
    ): Promise<void>;

    updateTitle(title: string): Promise<void>;
}

export interface IRoomOptions {
    readonly presenter: IPresenterUser;

    readonly state?: IRoomStates;

    readonly title: string;
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

    const attendees = new Set<IAttendeeUser>();
    const displays = new Set<IDisplayEntity>();

    return {
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
            state = ROOM_STATES.disposed;
        },

        async updatePIN() {
            if (state === ROOM_STATES.disposed) {
                throw new RoomDisposedError(
                    `bad dispatch to 'IRoom.updatePIN' (room '${pin}' was previously disposed.)`,
                );
            }

            pin = generatePIN();

            return pin;
        },

        async updateState(value) {
            if (state === ROOM_STATES.disposed) {
                throw new RoomDisposedError(
                    `bad dispatch to 'IRoom.updateState' (room '${pin}' was previously disposed.)`,
                );
            }

            state = value;
        },

        async updateTitle(value) {
            if (state === ROOM_STATES.disposed) {
                throw new RoomDisposedError(
                    `bad dispatch to 'IRoom.updateTitle' (room '${pin}' was previously disposed.)`,
                );
            }

            title = value;
        },
    };
}
