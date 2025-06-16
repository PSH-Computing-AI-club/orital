export const ROOM_STATES = {
    disposed: "STATE_DISPOSED",

    locked: "STATE_LOCKED",

    permissive: "STATE_PERMISSIVE",

    unlocked: "STATE_UNLOCKED",
} as const;

export const ENTITY_STATES = {
    connected: "STATE_CONNECTED",

    disposed: "STATE_DISPOSED",
} as const;

export const DISPLAY_ENTITY_STATES = {
    ...ENTITY_STATES,
} as const;

export const USER_STATES = {
    ...ENTITY_STATES,
} as const;

export const ATTENDEE_USER_STATES = {
    ...USER_STATES,

    awaiting: "STATE_AWAITING",
} as const;

export const PRESENTER_USER_STATES = {
    ...USER_STATES,
} as const;

export type IAttendeeUserStates =
    (typeof ATTENDEE_USER_STATES)[keyof typeof ATTENDEE_USER_STATES];

export type IDisplayEntityStates =
    (typeof DISPLAY_ENTITY_STATES)[keyof typeof DISPLAY_ENTITY_STATES];

export type IEntityStates = (typeof ENTITY_STATES)[keyof typeof ENTITY_STATES];

export type IPresenterUserStates =
    (typeof PRESENTER_USER_STATES)[keyof typeof PRESENTER_USER_STATES];

export type IRoomStates = (typeof ROOM_STATES)[keyof typeof ROOM_STATES];

export type IUserStates = (typeof USER_STATES)[keyof typeof USER_STATES];
