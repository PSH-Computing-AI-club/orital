import {and, eq} from "drizzle-orm";

import type {ActionFunctionArgs, LoaderFunctionArgs} from "react-router";
import {data} from "react-router";

import * as v from "valibot";

import {validateParams} from "../../../guards/validation";

import ATTENDEES_TABLE from "../../database/tables/attendees_table";
import ROOMS_TABLE from "../../database/tables/rooms_table";

import {useTransaction} from "../../state/transaction";

import {generatePIN} from "../../utils/crypto";
import {ulid} from "../../utils/valibot";

import type {IUser} from "../users_service";
import {requireAuthenticatedSession} from "../users_service";

import type {IAttendeeUser} from "./attendee_user";
import {isAttendeeUser} from "./attendee_user";
import type {IRoom} from "./room";
import makeRoom from "./room";
import type {IPresenterUser} from "./presenter_user";
import type {IRoomStates} from "./states";
import {
    ATTENDEE_USER_STATES,
    PRESENTER_USER_STATES,
    ROOM_STATES,
} from "./states";

const ACTION_PARAMS_SCHEMA = v.object({
    roomID: ulid,
});

const LIVE_ROOMS_BY_PIN = new Map<string, IRoom>();

const LIVE_ROOMS_BY_PRESENTER_ID = new Map<number, IRoom>();

const LIVE_ROOMS_BY_ROOM_ID = new Map<string, IRoom>();

export interface IAuthenticatedRoomSession {
    readonly room: IRoom;

    readonly user: IUser;
}

export interface IAuthenticatedAttendeeRoomSession
    extends IAuthenticatedRoomSession {
    readonly attendee: IAttendeeUser;
}

export interface IAuthenticatedPresenterRoomSession
    extends IAuthenticatedRoomSession {
    readonly presenter: IPresenterUser;
}

export interface IInsertOneOptions {
    readonly presenter: IUser;

    readonly state?: IRoomStates;

    readonly title?: string;
}

export function findAllLive(): IRoom[] {
    return Array.from(LIVE_ROOMS_BY_ROOM_ID.values());
}

export function findOneLiveByPIN(pin: string): IRoom | null {
    return LIVE_ROOMS_BY_PIN.get(pin) ?? null;
}

export function findOneLiveByPresenterID(userID: number): IRoom | null {
    return LIVE_ROOMS_BY_PRESENTER_ID.get(userID) ?? null;
}

export function findOneLiveByRoomID(roomID: string): IRoom | null {
    return LIVE_ROOMS_BY_ROOM_ID.get(roomID) ?? null;
}

export function generateUniquePIN(): string {
    let pin = generatePIN();

    while (LIVE_ROOMS_BY_PIN.has(pin)) {
        pin = generatePIN();
    }

    return pin;
}

export async function insertOneLive(
    options: IInsertOneOptions,
): Promise<IRoom> {
    const {presenter, state = ROOM_STATES.locked, title} = options;

    const {id: userID} = presenter;

    const transaction = useTransaction();

    const [storedRoom] = await transaction
        .insert(ROOMS_TABLE)
        .values({
            title,
            presenterUserID: userID,
        })
        .returning();

    const {
        createdAt,
        id: internalRoomID,
        roomID,
        title: storedTitle,
    } = storedRoom;

    const pin = generateUniquePIN();

    const room = makeRoom({
        createdAt,
        pin,
        presenter,
        roomID,
        state,
        id: internalRoomID,
        title: storedTitle,
    });

    LIVE_ROOMS_BY_PIN.set(pin, room);
    LIVE_ROOMS_BY_PRESENTER_ID.set(userID, room);
    LIVE_ROOMS_BY_ROOM_ID.set(roomID, room);

    const attendeeApprovedSubscription = room.EVENT_ATTENDEE_APPROVED.subscribe(
        async (event) => {
            const {attendee} = event;
            const {id: userID} = attendee;

            const transaction = useTransaction();

            await transaction
                .insert(ATTENDEES_TABLE)
                .values({
                    userID: userID,
                    roomID: internalRoomID,
                })
                .onConflictDoNothing();
        },
    );

    const entityAddedSubscription = room.EVENT_ENTITY_ADDED.subscribe(
        async (event) => {
            const {entity} = event;

            if (isAttendeeUser(entity)) {
                const {user, state} = entity;

                if (state !== ATTENDEE_USER_STATES.connected) {
                    return;
                }

                const {id: userID} = user;

                const transaction = useTransaction();

                await transaction
                    .insert(ATTENDEES_TABLE)
                    .values({
                        userID: userID,
                        roomID: internalRoomID,
                    })
                    .onConflictDoNothing();
            }
        },
    );

    const pinUpdateSubscription = room.EVENT_PIN_UPDATE.subscribe((event) => {
        const {newPIN, oldPIN} = event;

        LIVE_ROOMS_BY_PIN.set(newPIN, room);
        LIVE_ROOMS_BY_PIN.delete(oldPIN);
    });

    const stateUpdateSubscription = room.EVENT_STATE_UPDATE.subscribe(
        (event) => {
            const {newState} = event;

            if (newState === ROOM_STATES.disposed) {
                const {pin} = room;

                attendeeApprovedSubscription.dispose();
                entityAddedSubscription.dispose();
                pinUpdateSubscription.dispose();
                stateUpdateSubscription.dispose();
                titleUpdateSubscription.dispose();

                LIVE_ROOMS_BY_PIN.delete(pin);
                LIVE_ROOMS_BY_PRESENTER_ID.delete(userID);
                LIVE_ROOMS_BY_ROOM_ID.delete(roomID);
            }
        },
    );

    const titleUpdateSubscription = room.EVENT_TITLE_UPDATE.subscribe(
        async (event) => {
            const {newTitle} = event;

            const transaction = useTransaction();

            await transaction
                .update(ROOMS_TABLE)
                .set({title: newTitle})
                .where(eq(ROOMS_TABLE.id, internalRoomID));
        },
    );

    return room;
}

export async function requireAuthenticatedAttendeeAction(
    actionArgs: ActionFunctionArgs,
): Promise<IAuthenticatedAttendeeRoomSession> {
    const {roomID} = validateParams(ACTION_PARAMS_SCHEMA, actionArgs);

    const session = await requireAuthenticatedAttendeeSession(
        actionArgs,
        roomID,
    );

    const {attendee} = session;

    if (attendee.state !== ATTENDEE_USER_STATES.connected) {
        console.log("welp", {state: attendee.state});

        throw data("Conflict", {
            status: 409,
        });
    }

    return session;
}

export async function requireAuthenticatedAttendeeConnection(
    requestArgs: ActionFunctionArgs | LoaderFunctionArgs,
    roomID: string,
): Promise<IAuthenticatedRoomSession> {
    const {identifiable: user} = await requireAuthenticatedSession(requestArgs);

    const room = LIVE_ROOMS_BY_ROOM_ID.get(roomID) ?? null;

    if (room === null) {
        throw data("Not Found", {
            status: 404,
        });
    }

    const {bannedAccountIDs} = room;
    const {accountID} = user;

    if (bannedAccountIDs.has(accountID)) {
        throw data("Forbidden", {
            status: 403,
        });
    }

    switch (room.state) {
        case ROOM_STATES.disposed:
            throw data("Conflict", {
                status: 409,
            });

        case ROOM_STATES.locked:
            throw data("Locked", {
                status: 423,
            });
    }

    for (const attendee of room.attendees.values()) {
        // **TODO:** We should probably create a a direct lookup for by user id...
        // but this is good enough to now. ¯\_(ツ)_/¯
        if (attendee.user.id === user.id) {
            throw data("Conflict", {
                status: 409,
            });
        }
    }

    return {
        room,
        user,
    };
}

export async function requireAuthenticatedAttendeeSession(
    requestArgs: ActionFunctionArgs | LoaderFunctionArgs,
    roomID: string,
): Promise<IAuthenticatedAttendeeRoomSession> {
    const {identifiable: user} = await requireAuthenticatedSession(requestArgs);

    const room = LIVE_ROOMS_BY_ROOM_ID.get(roomID) ?? null;

    if (room === null) {
        throw data("Not Found", {
            status: 404,
        });
    }

    let foundAttendee: IAttendeeUser | null = null;

    for (const attendee of room.attendees.values()) {
        if (attendee.user.id === user.id) {
            foundAttendee = attendee;
            break;
        }
    }

    if (foundAttendee === null) {
        throw data("Forbidden", {
            status: 403,
        });
    }

    if (room.state === ROOM_STATES.disposed) {
        throw data("Conflict", {
            status: 409,
        });
    }

    return {
        room,
        user,

        attendee: foundAttendee,
    };
}

export async function requireAuthenticatedDisplayConnection(
    requestArgs: ActionFunctionArgs | LoaderFunctionArgs,
    roomID: string,
): Promise<IAuthenticatedRoomSession> {
    const {identifiable: user} = await requireAuthenticatedSession(requestArgs);

    const room = LIVE_ROOMS_BY_ROOM_ID.get(roomID) ?? null;

    if (room === null) {
        throw data("Not Found", {
            status: 404,
        });
    }

    if (room.state === ROOM_STATES.disposed) {
        throw data("Conflict", {
            status: 409,
        });
    }

    return {
        room,
        user,
    };
}

export async function requireAuthenticatedPresenterAction(
    actionArgs: ActionFunctionArgs,
): Promise<IAuthenticatedPresenterRoomSession> {
    const {roomID} = validateParams(ACTION_PARAMS_SCHEMA, actionArgs);

    const session = await requireAuthenticatedPresenterSession(
        actionArgs,
        roomID,
    );

    const {presenter} = session;

    if (presenter.state !== PRESENTER_USER_STATES.connected) {
        throw data("Conflict", {
            status: 409,
        });
    }

    return session;
}

export async function requireAuthenticatedPresenterConnection(
    requestArgs: ActionFunctionArgs | LoaderFunctionArgs,
    roomID: string,
): Promise<IAuthenticatedRoomSession> {
    const {identifiable: user} = await requireAuthenticatedSession(requestArgs);

    const room = LIVE_ROOMS_BY_ROOM_ID.get(roomID) ?? null;

    if (room === null) {
        throw data("Not Found", {
            status: 404,
        });
    }

    if (room.presenter.id !== user.id) {
        throw data("Forbidden", {
            status: 403,
        });
    }

    if (room.state === ROOM_STATES.disposed || room.presenterEntity) {
        throw data("Conflict", {
            status: 409,
        });
    }

    return {
        room,
        user,
    };
}

export async function requireAuthenticatedPresenterSession(
    requestArgs: ActionFunctionArgs | LoaderFunctionArgs,
    roomID: string,
): Promise<IAuthenticatedPresenterRoomSession> {
    const {identifiable: user} = await requireAuthenticatedSession(requestArgs);

    const room = LIVE_ROOMS_BY_ROOM_ID.get(roomID) ?? null;

    if (room === null) {
        throw data("Not Found", {
            status: 404,
        });
    }

    if (room.presenter.id !== user.id) {
        throw data("Forbidden", {
            status: 403,
        });
    }

    if (room.state === ROOM_STATES.disposed) {
        throw data("Conflict", {
            status: 409,
        });
    }

    const {presenterEntity: presenter} = room;

    if (presenter === null) {
        throw data("Conflict", {
            status: 409,
        });
    }

    return {
        presenter,
        room,
        user,
    };
}
