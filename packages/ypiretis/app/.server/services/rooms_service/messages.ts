import type {IAttendeeUserStates} from "./attendee_user";
import type {IDisplayEntityStates} from "./display_entity";
import type {IEntityStates} from "./entity";
import type {IPresenterUserStates} from "./presenter_user";
import type {IRoomStates} from "./room";

export type IMessageData =
    | boolean
    | null
    | number
    | string
    | IMessageData[]
    | {[key: number | string]: IMessageData};

export interface IMessage<N extends string, D extends IMessageData = null> {
    readonly event: N;

    readonly data: D;
}

export type IAttendeeUserStateUpdate = IMessage<
    "attendeeUser.stateUpdate",
    {
        readonly entityID: number;

        readonly state: IAttendeeUserStates;
    }
>;

export type IDisplayEntityStateUpdate = IMessage<
    "displayEntity.stateUpdate",
    {
        readonly entityID: number;

        readonly state: IDisplayEntityStates;
    }
>;

export type IRoomAttendeeAddedMessage = IMessage<
    "room.attendeeAdded",
    {
        readonly accountID: string;

        readonly entityID: number;

        readonly firstName: string;

        readonly lastName: string;

        readonly state: IAttendeeUserStates;
    }
>;

export type IRoomAttendeeDisposedMessage = IMessage<
    "room.attendeeDisposed",
    {
        readonly entityID: number;
    }
>;

export type IRoomDisplayAddedMessage = IMessage<
    "room.displayAdded",
    {
        readonly entityID: number;

        readonly state: IDisplayEntityStates;
    }
>;

export type IRoomDisplayDisposedMessage = IMessage<
    "room.displayDisposed",
    {
        readonly entityID: number;
    }
>;

export type IRoomPINUpdateMessage = IMessage<
    "room.pinUpdate",
    {
        readonly pin: string;
    }
>;

export type IRoomStateUpdateMessage = IMessage<
    "room.stateUpdate",
    {
        readonly state: IRoomStates;
    }
>;

export type IRoomTitleUpdateMessage = IMessage<
    "room.titleUpdate",
    {
        readonly title: string;
    }
>;

export type ISelfBannedMessage = IMessage<"self.banned">;

export type ISelfKickedMessage = IMessage<"self.kicked">;

export type ISelfRejectedMessage = IMessage<"self.rejected">;

export type ISelfStateUpdateMessage = IMessage<
    "self.stateUpdate",
    {
        readonly state: IEntityStates;
    }
>;

export type ISelfAttendeeUserStateUpdateMessage = IMessage<
    "self.stateUpdate",
    {
        readonly state: IAttendeeUserStates;
    }
>;

export type ISelfPresenterUserStateUpdateMessage = IMessage<
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
