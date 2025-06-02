import type {DeepReadonly} from "../utils/types";

import type {IUser} from "./users_service";

export const ATTENDEE_STATES = {
    awaiting: "STATE_AWAITING",

    permitted: "STATE_PERMITTED",
} as const;

export const ROOM_STATES = {
    open: "STATE_OPEN",

    permissive: "STATE_PERMISSIVE",

    staging: "STATE_STAGING",
} as const;

export type IRoomEventData =
    | boolean
    | number
    | string
    | IRoomEventData[]
    | {[key: number | string]: IRoomEventData};

export type IAttendeeStates =
    (typeof ATTENDEE_STATES)[keyof typeof ATTENDEE_STATES];

export type IRoomStates = (typeof ROOM_STATES)[keyof typeof ROOM_STATES];

// these events are to do
export type IAttendeeEvents = null;

export type IDisplayEvents = null;

export type IPresenterEvents = null;

export interface IRoomEvent<N extends string, D extends IRoomEventData> {
    readonly event: N;

    readonly data: D;
}

export interface IConnection<T extends IRoomEvent<any, any>> {
    abort(): void;

    send(args: T): void;
}

export interface IEntity<T extends IRoomEvent<any, any>> {
    readonly connection: IConnection<T>;
}

export interface IRoomUser<T extends IRoomEvent<any, any>> extends IEntity<T> {
    readonly account: IUser;
}

export interface IAttendeeUser extends IRoomUser<IAttendeeEvents> {
    readonly state: IAttendeeStates;
}

export interface IDisplayWindow extends IEntity<IDisplayEvents> {}

export interface IPresenterUser extends IRoomUser<IPresenterEvents> {}

interface IInternalRoom {
    attendees: IAttendeeUser[];

    displays: IDisplayWindow[];

    pin: string;

    presenter: IPresenterUser;

    title: string;

    state: IRoomStates;
}

export interface IRoom extends DeepReadonly<IInternalRoom> {}
