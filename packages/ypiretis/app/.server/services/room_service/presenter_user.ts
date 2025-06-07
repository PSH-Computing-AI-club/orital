import type {IEntityMessage} from "./entity";
import {SYMBOL_ENTITY_ON_DISPOSE} from "./entity";

import {isAttendeeUser} from "./attendee_user";
import {isDisplayEntity} from "./display_entity";
import type {IRoomStates} from "./room";
import type {IUser, IUserOptions} from "./user";
import makeUser from "./user";

const SYMBOL_PRESENTER_USER_BRAND: unique symbol = Symbol();

export const PRESENTER_ENTITY_ID = 1;

export type IPresenterUserMessages =
    | IPresenterRoomAttendeeAddedMessage
    | IPresenterRoomAttendeeDisposedMessage
    | IPresenterRoomDisplayAddedMessage
    | IPresenterRoomDisplayDisposedMessage
    | IPresenterRoomPINUpdateMessage
    | IPresenterRoomStateUpdateMessage
    | IPresenterRoomTitleUpdateMessage;

export type IPresenterRoomAttendeeAddedMessage = IEntityMessage<
    "room.attendeeAdded",
    {
        readonly accountID: string;

        readonly entityID: number;

        readonly firstName: string;

        readonly lastName: string;
    }
>;

export type IPresenterRoomAttendeeDisposedMessage = IEntityMessage<
    "room.attendeeDisposed",
    {
        readonly entityID: number;
    }
>;

export type IPresenterRoomDisplayAddedMessage = IEntityMessage<
    "room.displayAdded",
    {
        readonly entityID: number;
    }
>;

export type IPresenterRoomDisplayDisposedMessage = IEntityMessage<
    "room.displayDisposed",
    {
        readonly entityID: number;
    }
>;

export type IPresenterRoomPINUpdateMessage = IEntityMessage<
    "room.pinUpdate",
    {
        readonly pin: string;
    }
>;

export type IPresenterRoomStateUpdateMessage = IEntityMessage<
    "room.stateUpdate",
    {
        readonly state: IRoomStates;
    }
>;

export type IPresenterRoomTitleUpdateMessage = IEntityMessage<
    "room.titleUpdate",
    {
        readonly title: string;
    }
>;

export interface IPresenterUserOptions extends IUserOptions {}

export interface IPresenterUser extends IUser<IPresenterUserMessages> {
    [SYMBOL_PRESENTER_USER_BRAND]: true;

    [SYMBOL_ENTITY_ON_DISPOSE](): void;
}

export function isPresenterUser(value: unknown): value is IPresenterUser {
    return (
        value !== null &&
        typeof value === "object" &&
        SYMBOL_PRESENTER_USER_BRAND in value
    );
}

export default function makePresenterUser(
    options: IPresenterUserOptions,
): IPresenterUser {
    const {room} = options;

    const user = makeUser<IPresenterUserMessages>(options);

    const presenter = {
        ...user,

        [SYMBOL_PRESENTER_USER_BRAND]: true,

        [SYMBOL_ENTITY_ON_DISPOSE]() {
            entityAddedSubscription.dispose();
            entityDisposedSubscription.dispose();

            pinUpdateSubscription.dispose();
            stateUpdateSubscription.dispose();
            titleUpdateSubscription.dispose();
        },
    } satisfies IPresenterUser;

    const entityAddedSubscription = room.EVENT_ENTITY_ADDED.subscribe(
        (event) => {
            const {entity} = event;

            if (isAttendeeUser(entity)) {
                const {id, user} = entity;
                const {accountID, firstName, lastName} = user;

                presenter._dispatch({
                    event: "room.attendeeAdded",

                    data: {
                        accountID,
                        entityID: id,
                        firstName,
                        lastName,
                    },
                });
            } else if (isDisplayEntity(entity)) {
                const {id} = entity;

                presenter._dispatch({
                    event: "room.displayAdded",

                    data: {
                        entityID: id,
                    },
                });
            }
        },
    );

    const entityDisposedSubscription = room.EVENT_ENTITY_DISPOSED.subscribe(
        (event) => {
            const {entity} = event;

            if (isAttendeeUser(entity)) {
                const {id} = entity;

                presenter._dispatch({
                    event: "room.attendeeDisposed",

                    data: {
                        entityID: id,
                    },
                });
            } else if (isDisplayEntity(entity)) {
                const {id} = entity;

                presenter._dispatch({
                    event: "room.displayDisposed",

                    data: {
                        entityID: id,
                    },
                });
            }
        },
    );

    const pinUpdateSubscription = room.EVENT_PIN_UPDATE.subscribe((event) => {
        const {newPIN} = event;

        presenter._dispatch({
            event: "room.pinUpdate",

            data: {
                pin: newPIN,
            },
        });
    });

    const stateUpdateSubscription = room.EVENT_STATE_UPDATE.subscribe(
        (event) => {
            const {newState} = event;

            presenter._dispatch({
                event: "room.stateUpdate",

                data: {
                    state: newState,
                },
            });
        },
    );

    const titleUpdateSubscription = room.EVENT_TITLE_UPDATE.subscribe(
        (event) => {
            const {newTitle} = event;

            presenter._dispatch({
                event: "room.titleUpdate",

                data: {
                    title: newTitle,
                },
            });
        },
    );

    return presenter;
}
