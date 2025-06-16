import {ENTITY_STATES} from "./entity";
import type {
    ISelfAttendeeUserStateUpdateMessage,
    ISelfBannedMessage,
    ISelfKickedMessage,
    ISelfRejectedMessage,
    ISelfStateUpdateMessage,
} from "./messages";
import type {IUser, IUserMessages, IUserOptions} from "./user";
import makeUser from "./user";

const SYMBOL_ATTENDEE_USER_BRAND: unique symbol = Symbol();

export const ATTENDEE_USER_STATES = {
    ...ENTITY_STATES,

    awaiting: "STATE_AWAITING",
} as const;

export type IAttendeeUserStates =
    (typeof ATTENDEE_USER_STATES)[keyof typeof ATTENDEE_USER_STATES];

export type IAttendeeUserMessages =
    | ISelfAttendeeUserStateUpdateMessage
    | ISelfBannedMessage
    | ISelfKickedMessage
    | ISelfRejectedMessage
    | Exclude<IUserMessages, ISelfStateUpdateMessage>;

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
