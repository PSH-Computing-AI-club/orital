import type {DeepReadonly} from "../../utils/types";

import type {IAttendeeUser} from "./attendee_user";
import {isAttendeeUser} from "./attendee_user";
import type {IDisplayEntity} from "./display_entity";
import {isDisplayEntity} from "./display_entity";
import type {IGenericEntity} from "./entity";
import {InvalidEntityTypeError} from "./entity";
import type {IPresenterUser} from "./presenter_user";
import {isPresenterUser} from "./presenter_user";

export const ROOM_STATES = {
    open: "STATE_OPEN",

    permissive: "STATE_PERMISSIVE",

    staging: "STATE_STAGING",
} as const;

export type IRoomStates = (typeof ROOM_STATES)[keyof typeof ROOM_STATES];

export type IRoom = DeepReadonly<IInternalRoom>;

interface IInternalRoom {
    attendees: Set<IAttendeeUser>;

    displays: Set<IDisplayEntity>;

    readonly pin: string;

    readonly presenter: IPresenterUser;

    readonly title: string;

    readonly state: IRoomStates;

    _entityDisposed(entity: IGenericEntity): void;

    dispose(): void;
}

export default function makeRoom(): IRoom {
    const attendees = new Set<IAttendeeUser>();
    const displays = new Set<IDisplayEntity>();

    const room = {
        attendees,
        displays,

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

        dispose() {},
    } satisfies IInternalRoom;

    return room;
}
