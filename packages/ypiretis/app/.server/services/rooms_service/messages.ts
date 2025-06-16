import type {IAttendeeUserStates} from "./attendee_user";
import type {IDisplayEntityStates} from "./display_entity";
import type {IEntityStates} from "./entity";
import type {IPresenterUserStates} from "./presenter_user";
import type {IRoomStates} from "./room";

export type IEntityMessageData =
    | boolean
    | null
    | number
    | string
    | IEntityMessageData[]
    | {[key: number | string]: IEntityMessageData};

export interface IEntityMessage<
    N extends string,
    D extends IEntityMessageData = null,
> {
    readonly event: N;

    readonly data: D;
}

export type IAttendeeUserStateUpdate = IEntityMessage<
    "attendeeUser.stateUpdate",
    {
        readonly entityID: number;

        readonly state: IAttendeeUserStates;
    }
>;

export type IDisplayEntityStateUpdate = IEntityMessage<
    "displayEntity.stateUpdate",
    {
        readonly entityID: number;

        readonly state: IDisplayEntityStates;
    }
>;

export type IRoomAttendeeAddedMessage = IEntityMessage<
    "room.attendeeAdded",
    {
        readonly accountID: string;

        readonly entityID: number;

        readonly firstName: string;

        readonly lastName: string;

        readonly state: IAttendeeUserStates;
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

        readonly state: IDisplayEntityStates;
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

export type ISelfBannedMessage = IEntityMessage<"self.banned">;

export type ISelfKickedMessage = IEntityMessage<"self.kicked">;

export type ISelfRejectedMessage = IEntityMessage<"self.rejected">;

export type ISelfStateUpdateMessage = IEntityMessage<
    "self.stateUpdate",
    {
        readonly state: IEntityStates;
    }
>;

export type ISelfAttendeeUserStateUpdateMessage = IEntityMessage<
    "self.stateUpdate",
    {
        readonly state: IAttendeeUserStates;
    }
>;

export type ISelfPresenterUserStateUpdateMessage = IEntityMessage<
    "self.stateUpdate",
    {
        readonly state: IPresenterUserStates;
    }
>;

export type IEntityMessages =
    | IRoomStateUpdateMessage
    | IRoomTitleUpdateMessage
    | ISelfStateUpdateMessage;

export type IDisplayEntityMessages = IRoomPINUpdateMessage | IEntityMessages;

export type IUserMessages = IEntityMessages;

export type IAttendeeUserMessages =
    | ISelfAttendeeUserStateUpdateMessage
    | ISelfBannedMessage
    | ISelfKickedMessage
    | ISelfRejectedMessage
    | Exclude<IUserMessages, ISelfStateUpdateMessage>;

export type IPresenterUserMessages =
    | IAttendeeUserStateUpdate
    | IDisplayEntityStateUpdate
    | IRoomAttendeeAddedMessage
    | IRoomAttendeeDisposedMessage
    | IRoomDisplayAddedMessage
    | IRoomDisplayDisposedMessage
    | IRoomPINUpdateMessage
    | ISelfPresenterUserStateUpdateMessage
    | Exclude<IUserMessages, ISelfStateUpdateMessage>;
