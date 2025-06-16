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
} from "./symbols";
import type {IUserEntity, IUserEntityOptions} from "./user_entity";
import makeUserEntity from "./user_entity";

export interface IAttendeeUserOptions extends IUserEntityOptions {}

export interface IAttendeeUser
    extends IUserEntity<IAttendeeUserMessages, IAttendeeUserStates> {
    [SYMBOL_ATTENDEE_USER_BRAND]: true;

    approve(): void;

    ban(): void;

    kick(): void;

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
    const {room, user: userData} = options;

    const {approvedAccountIDs, state: roomState} = room;
    const {accountID} = userData;

    const userEntity = makeUserEntity<
        IAttendeeUserMessages,
        IAttendeeUserStates
    >(options);

    const initialState: IAttendeeUserStates =
        roomState === ROOM_STATES.permissive &&
        !approvedAccountIDs.has(accountID)
            ? ATTENDEE_USER_STATES.awaiting
            : ATTENDEE_USER_STATES.connected;

    return {
        ...userEntity,

        [SYMBOL_ATTENDEE_USER_BRAND]: true,

        state: initialState,

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
    };
}
