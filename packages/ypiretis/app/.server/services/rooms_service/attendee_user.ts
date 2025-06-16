import type {IAttendeeUserMessages} from "./messages";
import type {IAttendeeUserStates} from "./states";
import {ATTENDEE_USER_STATES} from "./states";
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
        // **HACK:** We cannot the room states from this file without causing
        // a circular dependency.
        roomState === "STATE_PERMISSIVE" && !approvedAccountIDs.has(accountID)
            ? ATTENDEE_USER_STATES.awaiting
            : ATTENDEE_USER_STATES.connected;

    return {
        ...userEntity,

        [SYMBOL_ATTENDEE_USER_BRAND]: true,

        state: initialState,

        approve() {
            const {state} = this;

            if (state !== ATTENDEE_USER_STATES.awaiting) {
                throw new TypeError(
                    "bad dispatch to 'IAttendeeUser.approve' (attendee is not currently awaiting approval)",
                );
            }

            room._attendeeApproved(this);

            this._updateState(ATTENDEE_USER_STATES.connected);
        },

        ban() {
            room._attendeeBanned(this);

            this._dispatch({
                event: "self.banned",
                data: null,
            });

            setTimeout(() => {
                this._disconnect();
            }, 0);
        },

        kick() {
            room._attendeeKicked(this);

            this._dispatch({
                event: "self.kicked",
                data: null,
            });

            setTimeout(() => {
                this._disconnect();
            }, 0);
        },

        reject() {
            const {state} = this;

            if (state !== ATTENDEE_USER_STATES.awaiting) {
                throw new TypeError(
                    "bad dispatch to 'IAttendeeUser.reject' (attendee is not currently awaiting approval)",
                );
            }

            this._dispatch({
                event: "self.rejected",
                data: null,
            });

            setTimeout(() => {
                this._disconnect();
            }, 0);
        },
    };
}
