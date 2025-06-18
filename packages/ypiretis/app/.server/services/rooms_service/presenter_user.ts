import {isAttendeeUser} from "./attendee_user";
import {isDisplayEntity} from "./display_entity";
import type {IPresenterUserMessages} from "./messages";
import {MESSAGE_EVENTS} from "./messages";
import type {IPresenterUserStates} from "./states";
import {PRESENTER_USER_STATES} from "./states";
import {SYMBOL_ENTITY_ON_DISPOSE, SYMBOL_PRESENTER_USER_BRAND} from "./symbols";
import type {IUserEntity, IUserEntityOptions} from "./user_entity";
import makeUserEntity from "./user_entity";

export const PRESENTER_ENTITY_ID = 1;

export interface IPresenterUserOptions
    extends IUserEntityOptions<IPresenterUserStates> {}

export interface IPresenterUser
    extends IUserEntity<IPresenterUserMessages, IPresenterUserStates> {
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

    const user = makeUserEntity<IPresenterUserMessages, IPresenterUserStates>(
        options,
    );

    const presenter = {
        ...user,

        get [SYMBOL_PRESENTER_USER_BRAND]() {
            return true as const;
        },

        [SYMBOL_ENTITY_ON_DISPOSE]() {
            user[SYMBOL_ENTITY_ON_DISPOSE]();

            attendeeHandUpdate.dispose();

            entityAddedSubscription.dispose();
            entityDisposedSubscription.dispose();
            entityStateSubscription.dispose();

            pinUpdateSubscription.dispose();
        },
    } satisfies IPresenterUser;

    const attendeeHandUpdate = room.EVENT_ATTENDEE_HAND_UPDATE.subscribe(
        (event) => {
            const {attendee, isRaisingHand} = event;
            const {id} = attendee;

            presenter._dispatch({
                event: MESSAGE_EVENTS.attendeeUserHandUpdate,

                data: {
                    entityID: id,
                    isRaisingHand,
                },
            });
        },
    );

    const entityAddedSubscription = room.EVENT_ENTITY_ADDED.subscribe(
        (event) => {
            const {entity} = event;

            if (isAttendeeUser(entity)) {
                const {id, state, user} = entity;
                const {accountID, firstName, lastName} = user;

                presenter._dispatch({
                    event: MESSAGE_EVENTS.roomAttendeeAdded,

                    data: {
                        accountID,
                        entityID: id,
                        firstName,
                        lastName,
                        state,
                    },
                });
            } else if (isDisplayEntity(entity)) {
                const {id, state} = entity;

                presenter._dispatch({
                    event: MESSAGE_EVENTS.roomDisplayAdded,

                    data: {
                        entityID: id,
                        state,
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
                    event: MESSAGE_EVENTS.roomAttendeeDisposed,

                    data: {
                        entityID: id,
                    },
                });
            } else if (isDisplayEntity(entity)) {
                const {id} = entity;

                presenter._dispatch({
                    event: MESSAGE_EVENTS.roomDisplayDisposed,

                    data: {
                        entityID: id,
                    },
                });
            }
        },
    );

    const entityStateSubscription = room.EVENT_ENTITY_STATE_UPDATE.subscribe(
        (event) => {
            const {entity} = event;

            if (isAttendeeUser(entity)) {
                const {newState} = event;
                const {id} = entity;

                presenter._dispatch({
                    event: MESSAGE_EVENTS.attendeeUserStateUpdate,

                    data: {
                        entityID: id,
                        state: newState,
                    },
                });
            } else if (isDisplayEntity(entity)) {
                const {newState} = event;
                const {id} = entity;

                presenter._dispatch({
                    event: MESSAGE_EVENTS.displayEntityStateUpdate,

                    data: {
                        entityID: id,
                        state: newState,
                    },
                });
            }
        },
    );

    const pinUpdateSubscription = room.EVENT_PIN_UPDATE.subscribe((event) => {
        const {newPIN} = event;

        presenter._dispatch({
            event: MESSAGE_EVENTS.roomPinUpdate,

            data: {
                pin: newPIN,
            },
        });
    });

    return presenter;
}
