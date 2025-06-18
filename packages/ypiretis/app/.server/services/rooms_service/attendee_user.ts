import {EntityStateError} from "./errors";
import type {IAttendeeUserMessages} from "./messages";
import {MESSAGE_EVENTS} from "./messages";
import type {IAttendeeUserStates} from "./states";
import {ATTENDEE_USER_STATES, ROOM_STATES} from "./states";
import {
    SYMBOL_ATTENDEE_USER_BRAND,
    SYMBOL_ATTENDEE_USER_ON_APPROVED,
    SYMBOL_ATTENDEE_USER_ON_BANNED,
    SYMBOL_ATTENDEE_USER_ON_KICKED,
    SYMBOL_ATTENDEE_USER_ON_HAND,
    SYMBOL_ENTITY_ON_STATE_UPDATE,
} from "./symbols";
import type {IUserEntity, IUserEntityOptions} from "./user_entity";
import makeUserEntity from "./user_entity";

export interface IAttendeeUserOptions
    extends IUserEntityOptions<IAttendeeUserStates> {}

export interface IAttendeeUser
    extends IUserEntity<IAttendeeUserMessages, IAttendeeUserStates> {
    [SYMBOL_ATTENDEE_USER_BRAND]: true;

    readonly isRaisingHand: boolean;

    approve(): void;

    ban(): void;

    dismissHand(): void;

    kick(): void;

    raiseHand(): void;

    reject(): void;
}

export function isAttendeeUser(value: unknown): value is IAttendeeUser {
    return (
        value !== null &&
        typeof value === "object" &&
        SYMBOL_ATTENDEE_USER_BRAND in value
    );
}

export default function makeAttendeeUser(
    options: IAttendeeUserOptions,
): IAttendeeUser {
    const {room, user: userData, state: initialState} = options;

    const {approvedAccountIDs, state: roomState} = room;
    const {accountID} = userData;

    const preferredState =
        roomState === ROOM_STATES.permissive &&
        !approvedAccountIDs.has(accountID)
            ? ATTENDEE_USER_STATES.awaiting
            : ATTENDEE_USER_STATES.connected;

    const userEntity = makeUserEntity<
        IAttendeeUserMessages,
        IAttendeeUserStates
    >({
        ...options,

        state: initialState ?? preferredState,
    });

    let isRaisingHand: boolean = false;

    const attendee = {
        ...userEntity,

        [SYMBOL_ATTENDEE_USER_BRAND]: true,

        [SYMBOL_ENTITY_ON_STATE_UPDATE](oldState, newState) {
            userEntity[SYMBOL_ENTITY_ON_STATE_UPDATE](oldState, newState);

            if (
                oldState === ATTENDEE_USER_STATES.awaiting &&
                newState === ATTENDEE_USER_STATES.connected
            ) {
                this._dispatch({
                    event: MESSAGE_EVENTS.roomTitleUpdate,

                    data: {
                        title: room.title,
                    },
                });
            }
        },

        get isRaisingHand() {
            return isRaisingHand;
        },

        approve() {
            const {state} = this;

            if (state !== ATTENDEE_USER_STATES.awaiting) {
                throw new EntityStateError(
                    "bad dispatch to 'IAttendeeUser.approve' (attendee is not currently awaiting approval)",
                );
            }

            room[SYMBOL_ATTENDEE_USER_ON_APPROVED](this);

            this._updateState(ATTENDEE_USER_STATES.connected);
        },

        ban() {
            room[SYMBOL_ATTENDEE_USER_ON_BANNED](this);

            this._dispatch({
                event: MESSAGE_EVENTS.selfBanned,
                data: null,
            });

            setTimeout(() => {
                this._disconnect();
            }, 0);
        },

        dismissHand() {
            if (!isRaisingHand) {
                throw new EntityStateError(
                    "bad dispatch to 'IAttendeeUser.dismissHand' (attendee is not raising their hand)",
                );
            }

            isRaisingHand = false;

            this._dispatch({
                event: MESSAGE_EVENTS.selfHand,
                data: {
                    isRaisingHand: false,
                },
            });

            room[SYMBOL_ATTENDEE_USER_ON_HAND](this, false);
        },

        kick() {
            room[SYMBOL_ATTENDEE_USER_ON_KICKED](this);

            this._dispatch({
                event: MESSAGE_EVENTS.selfKicked,
                data: null,
            });

            setTimeout(() => {
                this._disconnect();
            }, 0);
        },

        raiseHand() {
            if (isRaisingHand) {
                throw new EntityStateError(
                    "bad dispatch to 'IAttendeeUser.raiseHand' (attendee is already raising their hand)",
                );
            }

            isRaisingHand = true;

            this._dispatch({
                event: MESSAGE_EVENTS.selfHand,
                data: {
                    isRaisingHand: true,
                },
            });

            room[SYMBOL_ATTENDEE_USER_ON_HAND](this, true);
        },

        reject() {
            const {state} = this;

            if (state !== ATTENDEE_USER_STATES.awaiting) {
                throw new EntityStateError(
                    "bad dispatch to 'IAttendeeUser.reject' (attendee is not currently awaiting approval)",
                );
            }

            this._dispatch({
                event: MESSAGE_EVENTS.selfRejected,
                data: null,
            });

            setTimeout(() => {
                this._disconnect();
            }, 0);
        },
    } satisfies IAttendeeUser;

    if (initialState === ATTENDEE_USER_STATES.connected) {
        attendee._dispatch({
            event: MESSAGE_EVENTS.roomTitleUpdate,

            data: {
                title: room.title,
            },
        });
    }

    return attendee;
}
