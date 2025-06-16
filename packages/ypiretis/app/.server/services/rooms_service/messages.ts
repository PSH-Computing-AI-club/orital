import type {IAttendeeUserStates} from "./attendee_user";
import type {IDisplayEntityStates} from "./display_entity";
import type {IEntityStates} from "./entity";
import type {IPresenterUserStates} from "./presenter_user";
import type {IRoomStates} from "./room";

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
    | IAttendeeUserStateUpdateMessage
    | IDisplayEntityStateUpdateMessage
    | IRoomAttendeeAddedMessage
    | IRoomAttendeeDisposedMessage
    | IRoomDisplayAddedMessage
    | IRoomDisplayDisposedMessage
    | IRoomPINUpdateMessage
    | ISelfPresenterUserStateUpdateMessage
    | Exclude<IUserMessages, ISelfStateUpdateMessage>;

export type IMessageData =
    | boolean
    | null
    | number
    | string
    | IMessageData[]
    | {[key: number | string]: IMessageData};

export interface IMessage {
    readonly event: string;

    readonly data: IMessageData;
}

export interface IAttendeeUserStateUpdateMessage extends IMessage {
    readonly event: "attendeeUser.stateUpdate";

    readonly data: {
        readonly entityID: number;

        readonly state: IAttendeeUserStates;
    };
}

export interface IDisplayEntityStateUpdateMessage extends IMessage {
    readonly event: "displayEntity.stateUpdate";

    readonly data: {
        readonly entityID: number;

        readonly state: IDisplayEntityStates;
    };
}

export interface IRoomAttendeeAddedMessage extends IMessage {
    readonly event: "room.attendeeAdded";

    readonly data: {
        readonly accountID: string;

        readonly entityID: number;

        readonly firstName: string;

        readonly lastName: string;

        readonly state: IAttendeeUserStates;
    };
}

export interface IRoomAttendeeDisposedMessage extends IMessage {
    readonly event: "room.attendeeDisposed";

    readonly data: {
        readonly entityID: number;
    };
}

export interface IRoomDisplayAddedMessage extends IMessage {
    readonly event: "room.displayAdded";

    readonly data: {
        readonly entityID: number;

        readonly state: IDisplayEntityStates;
    };
}

export interface IRoomDisplayDisposedMessage extends IMessage {
    readonly event: "room.displayDisposed";

    readonly data: {
        readonly entityID: number;
    };
}

export interface IRoomPINUpdateMessage extends IMessage {
    readonly event: "room.pinUpdate";

    readonly data: {
        readonly pin: string;
    };
}

export interface IRoomStateUpdateMessage extends IMessage {
    readonly event: "room.stateUpdate";

    readonly data: {
        readonly state: IRoomStates;
    };
}

export interface IRoomTitleUpdateMessage extends IMessage {
    readonly event: "room.titleUpdate";

    readonly data: {
        readonly title: string;
    };
}

export interface ISelfBannedMessage extends IMessage {
    readonly event: "self.banned";
}

export interface ISelfKickedMessage extends IMessage {
    readonly event: "self.kicked";
}

export interface ISelfRejectedMessage extends IMessage {
    readonly event: "self.rejected";
}

export interface ISelfStateUpdateMessage extends IMessage {
    readonly event: "self.stateUpdate";

    readonly data: {
        readonly state: IEntityStates;
    };
}

export interface ISelfAttendeeUserStateUpdateMessage extends IMessage {
    readonly event: "self.stateUpdate";

    readonly data: {
        readonly state: IAttendeeUserStates;
    };
}

export interface ISelfPresenterUserStateUpdateMessage extends IMessage {
    readonly event: "self.stateUpdate";

    readonly data: {
        readonly state: IPresenterUserStates;
    };
}
