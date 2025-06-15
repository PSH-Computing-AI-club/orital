import {isAttendeeUser} from "./attendee_user";
import {isDisplayEntity} from "./display_entity";
import {ENTITY_STATES, SYMBOL_ENTITY_ON_DISPOSE} from "./entity";
import type {
    IAttendeeUserStateUpdate,
    IDisplayEntityStateUpdate,
    IRoomAttendeeAddedMessage,
    IRoomAttendeeDisposedMessage,
    IRoomDisplayAddedMessage,
    IRoomDisplayDisposedMessage,
    IRoomPINUpdateMessage,
    ISelfPresenterUserStateUpdateMessage,
    ISelfStateUpdateMessage,
} from "./messages";
import type {IUser, IUserMessages, IUserOptions} from "./user";
import makeUser from "./user";

const SYMBOL_PRESENTER_USER_BRAND: unique symbol = Symbol();

export const PRESENTER_ENTITY_ID = 1;

export const PRESENTER_USER_STATES = {
    ...ENTITY_STATES,
} as const;

export type IPresenterUserStates =
    (typeof PRESENTER_USER_STATES)[keyof typeof PRESENTER_USER_STATES];

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

export interface IPresenterUserOptions extends IUserOptions {}

export interface IPresenterUser
    extends IUser<IPresenterUserMessages, IPresenterUserStates> {
    [SYMBOL_PRESENTER_USER_BRAND]: true;
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

    const user = makeUser<IPresenterUserMessages, IPresenterUserStates>(
        options,
    );

    const presenter = {
        ...user,

        [SYMBOL_PRESENTER_USER_BRAND]: true,

        [SYMBOL_ENTITY_ON_DISPOSE]() {
            user[SYMBOL_ENTITY_ON_DISPOSE]();

            roomEntityAddedSubscription.dispose();
            roomEntityDisposedSubscription.dispose();

            roomPINUpdateSubscription.dispose();
        },
    } satisfies IPresenterUser;

    const attendeeSubscriptions = new Map<number, () => void>();
    const displaySubscriptions = new Map<number, () => void>();

    const roomEntityAddedSubscription = room.EVENT_ENTITY_ADDED.subscribe(
        (event) => {
            if (presenter.state !== ENTITY_STATES.connected) {
                return;
            }

            const {entity} = event;

            if (isAttendeeUser(entity)) {
                const {id, user} = entity;
                const {accountID, firstName, lastName} = user;

                const attendeeStateSubscription =
                    entity.EVENT_STATE_UPDATE.subscribe((event) => {
                        const {newState} = event;

                        presenter._dispatch({
                            event: "attendeeUser.stateUpdate",

                            data: {
                                entityID: id,
                                state: newState,
                            },
                        });
                    });

                attendeeSubscriptions.set(id, () => {
                    attendeeStateSubscription.dispose();
                });

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

                const displayStateSubscription =
                    entity.EVENT_STATE_UPDATE.subscribe((event) => {
                        const {newState} = event;

                        presenter._dispatch({
                            event: "displayEntity.stateUpdate",

                            data: {
                                entityID: id,
                                state: newState,
                            },
                        });
                    });

                displaySubscriptions.set(id, () => {
                    displayStateSubscription.dispose();
                });

                presenter._dispatch({
                    event: "room.displayAdded",

                    data: {
                        entityID: id,
                    },
                });
            }
        },
    );

    const roomEntityDisposedSubscription = room.EVENT_ENTITY_DISPOSED.subscribe(
        (event) => {
            if (presenter.state !== ENTITY_STATES.connected) {
                return;
            }

            const {entity} = event;

            if (isAttendeeUser(entity)) {
                const {id} = entity;

                const disposeCallback = attendeeSubscriptions.get(id) ?? null;

                if (disposeCallback !== null) {
                    disposeCallback();
                }

                presenter._dispatch({
                    event: "room.attendeeDisposed",

                    data: {
                        entityID: id,
                    },
                });
            } else if (isDisplayEntity(entity)) {
                const {id} = entity;

                const disposeCallback = displaySubscriptions.get(id) ?? null;

                if (disposeCallback !== null) {
                    disposeCallback();
                }

                presenter._dispatch({
                    event: "room.displayDisposed",

                    data: {
                        entityID: id,
                    },
                });
            }
        },
    );

    const roomPINUpdateSubscription = room.EVENT_PIN_UPDATE.subscribe(
        (event) => {
            if (presenter.state !== ENTITY_STATES.connected) {
                return;
            }

            const {newPIN} = event;

            presenter._dispatch({
                event: "room.pinUpdate",

                data: {
                    pin: newPIN,
                },
            });
        },
    );

    return presenter;
}
