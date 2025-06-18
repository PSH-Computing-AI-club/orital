import type {
    IAttendeeUserStates,
    IDisplayEntityStates,
    IEntityStates,
    IPresenterUserStates,
    IRoomStates,
} from "./states";

export const MESSAGE_EVENTS = {
    attendeeUserHandUpdate: "attendeeUser.handUpdate",

    attendeeUserStateUpdate: "attendeeUser.stateUpdate",

    displayEntityStateUpdate: "displayEntity.stateUpdate",

    roomAttendeeAdded: "room.attendeeAdded",

    roomAttendeeDisposed: "room.attendeeDisposed",

    roomDisplayAdded: "room.displayAdded",

    roomDisplayDisposed: "room.displayDisposed",

    roomPinUpdate: "room.pinUpdate",

    roomStateUpdate: "room.stateUpdate",

    roomTitleUpdate: "room.titleUpdate",

    selfBanned: "self.banned",

    selfKicked: "self.kicked",

    selfRejected: "self.rejected",

    selfHand: "self.hand",

    selfStateUpdate: "self.stateUpdate",
} as const;

export type IMessageEvents =
    (typeof MESSAGE_EVENTS)[keyof typeof MESSAGE_EVENTS];

export type IEntityMessages =
    | IRoomStateUpdateMessage
    | IRoomTitleUpdateMessage
    | ISelfStateUpdateMessage;

export type IDisplayEntityMessages = IRoomPINUpdateMessage | IEntityMessages;

export type IUserMessages = IEntityMessages;

export type IAttendeeUserMessages =
    | ISelfAttendeeUserStateUpdateMessage
    | ISelfBannedMessage
    | ISelfHandMessage
    | ISelfKickedMessage
    | ISelfRejectedMessage
    | Exclude<IUserMessages, ISelfStateUpdateMessage>;

export type IPresenterUserMessages =
    | IAttendeeUserHandUpdateMessage
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

export interface IAttendeeUserHandUpdateMessage extends IMessage {
    readonly event: typeof MESSAGE_EVENTS.attendeeUserHandUpdate;

    readonly data: {
        readonly entityID: number;

        readonly isRaisingHand: boolean;
    };
}

export interface IAttendeeUserStateUpdateMessage extends IMessage {
    readonly event: typeof MESSAGE_EVENTS.attendeeUserStateUpdate;

    readonly data: {
        readonly entityID: number;

        readonly state: IAttendeeUserStates;
    };
}

export interface IDisplayEntityStateUpdateMessage extends IMessage {
    readonly event: typeof MESSAGE_EVENTS.displayEntityStateUpdate;

    readonly data: {
        readonly entityID: number;

        readonly state: IDisplayEntityStates;
    };
}

export interface IRoomAttendeeAddedMessage extends IMessage {
    readonly event: typeof MESSAGE_EVENTS.roomAttendeeAdded;

    readonly data: {
        readonly accountID: string;

        readonly entityID: number;

        readonly firstName: string;

        readonly lastName: string;

        readonly state: IAttendeeUserStates;
    };
}

export interface IRoomAttendeeDisposedMessage extends IMessage {
    readonly event: typeof MESSAGE_EVENTS.roomAttendeeDisposed;

    readonly data: {
        readonly entityID: number;
    };
}

export interface IRoomDisplayAddedMessage extends IMessage {
    readonly event: typeof MESSAGE_EVENTS.roomDisplayAdded;

    readonly data: {
        readonly entityID: number;

        readonly state: IDisplayEntityStates;
    };
}

export interface IRoomDisplayDisposedMessage extends IMessage {
    readonly event: typeof MESSAGE_EVENTS.roomDisplayDisposed;

    readonly data: {
        readonly entityID: number;
    };
}

export interface IRoomPINUpdateMessage extends IMessage {
    readonly event: typeof MESSAGE_EVENTS.roomPinUpdate;

    readonly data: {
        readonly pin: string;
    };
}

export interface IRoomStateUpdateMessage extends IMessage {
    readonly event: typeof MESSAGE_EVENTS.roomStateUpdate;

    readonly data: {
        readonly state: IRoomStates;
    };
}

export interface IRoomTitleUpdateMessage extends IMessage {
    readonly event: typeof MESSAGE_EVENTS.roomTitleUpdate;

    readonly data: {
        readonly title: string;
    };
}

export interface ISelfBannedMessage extends IMessage {
    readonly event: typeof MESSAGE_EVENTS.selfBanned;
}

export interface ISelfHandMessage extends IMessage {
    readonly event: typeof MESSAGE_EVENTS.selfHand;

    readonly data: {
        readonly isRaisingHand: boolean;
    };
}

export interface ISelfKickedMessage extends IMessage {
    readonly event: typeof MESSAGE_EVENTS.selfKicked;
}

export interface ISelfRejectedMessage extends IMessage {
    readonly event: typeof MESSAGE_EVENTS.selfRejected;
}

export interface ISelfStateUpdateMessage extends IMessage {
    readonly event: typeof MESSAGE_EVENTS.selfStateUpdate;

    readonly data: {
        readonly state: IEntityStates;
    };
}

export interface ISelfAttendeeUserStateUpdateMessage extends IMessage {
    readonly event: typeof MESSAGE_EVENTS.selfStateUpdate;

    readonly data: {
        readonly state: IAttendeeUserStates;
    };
}

export interface ISelfPresenterUserStateUpdateMessage extends IMessage {
    readonly event: typeof MESSAGE_EVENTS.selfStateUpdate;

    readonly data: {
        readonly state: IPresenterUserStates;
    };
}
