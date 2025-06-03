import {ENTITY_STATES} from "./entity";
import type {IUser} from "./user";

const SYMBOL_ATTENDEE_USER_BRAND: unique symbol = Symbol();

export const ATTENDEE_STATES = {
    ...ENTITY_STATES,

    awaiting: "STATE_AWAITING",

    permitted: "STATE_PERMITTED",
} as const;

export type IAttendeeStates =
    (typeof ATTENDEE_STATES)[keyof typeof ATTENDEE_STATES];

export type IAttendeeEvents = null;

export interface IAttendeeUser extends IUser<IAttendeeEvents, IAttendeeStates> {
    [SYMBOL_ATTENDEE_USER_BRAND]: true;
}

export function isAttendeeUser(value: unknown): value is IAttendeeUser {
    return (
        value !== null &&
        typeof value === "object" &&
        SYMBOL_ATTENDEE_USER_BRAND in value
    );
}
