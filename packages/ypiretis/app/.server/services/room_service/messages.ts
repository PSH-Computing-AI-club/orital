import type {IRoomStates} from "./room";

export type IEntityMessageData =
    | boolean
    | number
    | string
    | IEntityMessageData[]
    | {[key: number | string]: IEntityMessageData};

export interface IEntityMessage<
    N extends string,
    D extends IEntityMessageData,
> {
    readonly event: N;

    readonly data: D;
}

export type IRoomAttendeeAddedMessage = IEntityMessage<
    "room.attendeeAdded",
    {
        readonly accountID: string;

        readonly entityID: number;

        readonly firstName: string;

        readonly lastName: string;
    }
>;

export type IRoomAttendeeDisposedMessage = IEntityMessage<
    "room.attendeeDisposed",
    {
        readonly entityID: number;
    }
>;

export type IRoomDisplayAddedMessage = IEntityMessage<
    "room.displayAdded",
    {
        readonly entityID: number;
    }
>;

export type IRoomDisplayDisposedMessage = IEntityMessage<
    "room.displayDisposed",
    {
        readonly entityID: number;
    }
>;

export type IRoomPINUpdateMessage = IEntityMessage<
    "room.pinUpdate",
    {
        readonly pin: string;
    }
>;

export type IRoomStateUpdateMessage = IEntityMessage<
    "room.stateUpdate",
    {
        readonly state: IRoomStates;
    }
>;

export type IRoomTitleUpdateMessage = IEntityMessage<
    "room.titleUpdate",
    {
        readonly title: string;
    }
>;
