import {EntityStateError} from "./errors";
import type {IAttendeeUserMessages} from "./messages";
import {MESSAGE_EVENTS} from "./messages";
import type {IAttendeeUserStates} from "./states";
import {ATTENDEE_USER_STATES, ROOM_STATES} from "./states";
import {SYMBOL_ATTENDEE_USER_BRAND} from "./symbols";
import type {IUser, IUserOptions} from "./user";
import makeUser from "./user";

export interface IAttendeeUserOptions extends IUserOptions {}

export interface IAttendeeUser
    extends IUser<IAttendeeUserMessages, IAttendeeUserStates> {
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

    const userEntity = makeUser<IAttendeeUserMessages, IAttendeeUserStates>(
        options,
    );

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

            room._attendeeApproved(this);

            this._updateState(ATTENDEE_USER_STATES.connected);
        },

        ban() {
            room._attendeeBanned(this);

            this._dispatch({
                event: MESSAGE_EVENTS.selfBanned,
                data: null,
            });

            setTimeout(() => {
                this._disconnect();
            }, 0);
        },

        kick() {
            room._attendeeKicked(this);

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
