import {isAttendeeUser} from "./attendee_user";
import {isDisplayEntity} from "./display_entity";
import {ENTITY_STATES, SYMBOL_ENTITY_ON_DISPOSE} from "./entity";
import type {
    IRoomAttendeeAddedMessage,
    IRoomAttendeeDisposedMessage,
    IRoomDisplayAddedMessage,
    IRoomDisplayDisposedMessage,
    IRoomPINUpdateMessage,
} from "./messages";
import type {IUser, IUserMessages, IUserOptions} from "./user";
import makeUser from "./user";

const SYMBOL_PRESENTER_USER_BRAND: unique symbol = Symbol();

export const PRESENTER_ENTITY_ID = 1;

export type IPresenterUserMessages =
    | IRoomAttendeeAddedMessage
    | IRoomAttendeeDisposedMessage
    | IRoomDisplayAddedMessage
    | IRoomDisplayDisposedMessage
    | IRoomPINUpdateMessage
    | IUserMessages;

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
            user[SYMBOL_ENTITY_ON_DISPOSE]();

            entityAddedSubscription.dispose();
            entityDisposedSubscription.dispose();

            pinUpdateSubscription.dispose();
        },
    } satisfies IPresenterUser;

    const entityAddedSubscription = room.EVENT_ENTITY_ADDED.subscribe(
        (event) => {
            if (presenter.state !== ENTITY_STATES.connected) {
                return;
            }

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
            if (presenter.state !== ENTITY_STATES.connected) {
                return;
            }

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
    });

    return presenter;
}
