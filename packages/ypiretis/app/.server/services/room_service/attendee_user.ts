import {ENTITY_STATES} from "./entity";
import type {IUser, IUserMessages, IUserOptions} from "./user";
import makeUser from "./user";

const SYMBOL_ATTENDEE_USER_BRAND: unique symbol = Symbol();

export const ATTENDEE_STATES = {
    ...ENTITY_STATES,

    awaiting: "STATE_AWAITING",
} as const;

export type IAttendeeUserStates =
    (typeof ATTENDEE_STATES)[keyof typeof ATTENDEE_STATES];

export type IAttendeeUserMessages = IUserMessages;

export interface IAttendeeUserOptions extends IUserOptions {}

export interface IAttendeeUser
    extends IUser<IAttendeeUserMessages, IAttendeeUserStates> {
    [SYMBOL_ATTENDEE_USER_BRAND]: true;
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
    const user = makeUser<IAttendeeUserMessages, IAttendeeUserStates>(options);

    return {
        ...user,

        [SYMBOL_ATTENDEE_USER_BRAND]: true,
    };
}
