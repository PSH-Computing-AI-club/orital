import type {IEvent} from "../../../utils/event";
import makeEvent from "../../../utils/event";

import type {DeepReadonly} from "../../utils/types";

import type {IAttendeeUser} from "./attendee_user";
import {isAttendeeUser} from "./attendee_user";
import type {IDisplayEntity} from "./display_entity";
import {isDisplayEntity} from "./display_entity";
import type {IEntity} from "./entity";
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
    readonly EVENT_ENTITY_DISPOSED: IEvent<IEntityDisposedEvent>;

    attendees: Set<IAttendeeUser>;

    displays: Set<IDisplayEntity>;

    pin: string;

    presenter: IPresenterUser;

    title: string;

    state: IRoomStates;

    dispose(): void;
}

export interface IEntityDisposedEvent {
    readonly entity: IEntity<any, any, any>;
}

export default function makeRoom(): IRoom {
    const EVENT_ENTITY_DISPOSED = makeEvent<IEntityDisposedEvent>();

    const attendees = new Set<IAttendeeUser>();
    const displays = new Set<IDisplayEntity>();

    const entityDisposedSubscription = EVENT_ENTITY_DISPOSED.subscribe(
        (event) => {
            const {entity} = event;

            if (isAttendeeUser(entity)) {
                attendees.delete(entity);
            } else if (isDisplayEntity(entity)) {
                displays.delete(entity);
            } else if (isPresenterUser(entity)) {
                room.dispose();
            }
        },
    );

    const room = {
        EVENT_ENTITY_DISPOSED,

        attendees,
        displays,

        dispose() {
            entityDisposedSubscription.dispose();
        },
    } satisfies IInternalRoom;

    return room;
}
