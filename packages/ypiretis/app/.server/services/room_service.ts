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

export interface IRoom {
    readonly attendees: IAttendeeUser[];

    readonly displays: IDisplayWindow[];

    readonly pin: string;

    readonly presenter: IPresenterUser;

    readonly title: string;

    readonly state: IRoomStates;

    broadcastToAttendees(event: IAttendeeEvents): void;

    broadcastToDisplays(event: IDisplayEvents): void;

    kickAttendee(userID: number): void;

    kickAttendees(): void;
}
