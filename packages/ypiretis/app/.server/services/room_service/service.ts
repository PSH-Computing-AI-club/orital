import type {ActionFunctionArgs} from "react-router";
import {data} from "react-router";

import {ulid} from "ulid";

import * as v from "valibot";

import {generatePIN} from "../../utils/crypto";

import type {IUser} from "../users_service";
import {requireAuthenticatedSession} from "../users_service";

import type {IAttendeeUser} from "./attendee_user";
import {ATTENDEE_USER_STATES} from "./attendee_user";
import type {IRoom, IRoomStates} from "./room";
import makeRoom, {ROOM_STATES} from "./room";
import type {IPresenterUser} from "./presenter_user";
import {PRESENTER_USER_STATES} from "./presenter_user";

const ACTION_PARAMS_SCHEMA = v.object({
    roomID: v.pipe(v.string(), v.ulid()),
});

const LIVE_ROOMS = new Map<string, IRoom>();

let idCounter = -1;

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
    return Array.from(LIVE_ROOMS.values());
}

export function findOneLiveByRoomID(roomID: string): IRoom | null {
    return LIVE_ROOMS.get(roomID) ?? null;
}

export function findOneLiveByPIN(pin: string): IRoom | null {
    return LIVE_ROOMS.get(pin) ?? null;
}

export function generateUniquePIN(): string {
    let pin = generatePIN();

    while (LIVE_ROOMS.has(pin)) {
        pin = generatePIN();
    }

    return pin;
}

export async function insertOneLive(
    options: IInsertOneOptions,
): Promise<IRoom> {
    const {
        presenter,
        state = ROOM_STATES.locked,
        title = "A Presentation Room",
    } = options;

    // **TODO:** Pull from options object when DB integration is ready
    const id = ++idCounter;
    const pin = generateUniquePIN();
    const roomID = ulid();

    // **TODO:** add to db

    const room = makeRoom({
        id,
        pin,
        presenter,
        roomID,
        state,
        title,
    });

    // **HACK:** We are actually doing a clever hack here. The room ID
    // ULIDs (26 characters) will never be the length of a PIN (6 characters).
    //
    // So, we can just use the same map for dual-indexing.
    LIVE_ROOMS.set(room.roomID, room);
    LIVE_ROOMS.set(room.pin, room);

    const pinUpdateSubscription = room.EVENT_PIN_UPDATE.subscribe((event) => {
        const {newPIN, oldPIN} = event;

        LIVE_ROOMS.set(newPIN, room);
        LIVE_ROOMS.delete(oldPIN);
    });

    const stateUpdateSubscription = room.EVENT_STATE_UPDATE.subscribe(
        (event) => {
            const {newState} = event;

            if (newState === ROOM_STATES.disposed) {
                pinUpdateSubscription.dispose();
                stateUpdateSubscription.dispose();
                titleUpdateSubscription.dispose();

                LIVE_ROOMS.delete(room.pin);
                LIVE_ROOMS.delete(room.roomID);
            }

            // **TODO:** update db state
        },
    );

    const titleUpdateSubscription = room.EVENT_TITLE_UPDATE.subscribe(
        (event) => {
            // **TODO:** update db title
        },
    );

    return room;
}

export async function requireAuthenticatedAttendeeAction(
    actionArgs: ActionFunctionArgs,
): Promise<IAuthenticatedAttendeeRoomSession> {
    const {params, request} = actionArgs;

    const {output, success} = v.safeParse(ACTION_PARAMS_SCHEMA, params);

    if (!success) {
        throw data("Bad Request", 400);
    }

    const session = await requireAuthenticatedAttendeeSession(
        request,
        output.roomID,
    );

    const {attendee} = session;

    if (attendee.state !== ATTENDEE_USER_STATES.connected) {
        throw data("Conflict", {
            status: 409,
        });
    }

    return session;
}

export async function requireAuthenticatedAttendeeConnection(
    request: Request,
    roomID: string,
): Promise<IAuthenticatedRoomSession> {
    const {identifiable: user} = await requireAuthenticatedSession(request);

    const room = LIVE_ROOMS.get(roomID) ?? null;

    if (room === null) {
        throw data("Not Found", {
            status: 404,
        });
    }

    switch (room.state) {
        case ROOM_STATES.disposed:
            throw data("Conflict", 409);

        case ROOM_STATES.locked:
            throw data("Locked", 423);
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
    request: Request,
    roomID: string,
): Promise<IAuthenticatedAttendeeRoomSession> {
    const {identifiable: user} = await requireAuthenticatedSession(request);

    const room = LIVE_ROOMS.get(roomID) ?? null;

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
        throw data("Conflict", 409);
    }

    return {
        room,
        user,

        attendee: foundAttendee,
    };
}

export async function requireAuthenticatedDisplayConnection(
    request: Request,
    roomID: string,
): Promise<IAuthenticatedRoomSession> {
    const {identifiable: user} = await requireAuthenticatedSession(request);

    const room = LIVE_ROOMS.get(roomID) ?? null;

    if (room === null) {
        throw data("Not Found", {
            status: 404,
        });
    }

    if (room.state === ROOM_STATES.disposed) {
        throw data("Conflict", 409);
    }

    return {
        room,
        user,
    };
}

export async function requireAuthenticatedPresenterAction(
    actionArgs: ActionFunctionArgs,
): Promise<IAuthenticatedPresenterRoomSession> {
    const {params, request} = actionArgs;

    const {output, success} = v.safeParse(ACTION_PARAMS_SCHEMA, params);

    if (!success) {
        throw data("Bad Request", 400);
    }

    const session = await requireAuthenticatedPresenterSession(
        request,
        output.roomID,
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
    request: Request,
    roomID: string,
): Promise<IAuthenticatedRoomSession> {
    const {identifiable: user} = await requireAuthenticatedSession(request);

    const room = LIVE_ROOMS.get(roomID) ?? null;

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
        throw data("Conflict", 409);
    }

    return {
        room,
        user,
    };
}

export async function requireAuthenticatedPresenterSession(
    request: Request,
    roomID: string,
): Promise<IAuthenticatedPresenterRoomSession> {
    const {identifiable: user} = await requireAuthenticatedSession(request);

    const room = LIVE_ROOMS.get(roomID) ?? null;

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
        throw data("Conflict", 409);
    }

    const {presenterEntity: presenter} = room;

    if (presenter === null) {
        throw data("Conflict", 409);
    }

    return {
        presenter,
        room,
        user,
    };
}
