import {data} from "react-router";

import {ulid} from "ulid";

import {APP_IS_PRODUCTION} from "../../../utils/constants";

import {generatePIN} from "../../utils/crypto";

import type {IUser} from "../users_service";
import {requireAuthenticatedSession} from "../users_service";

import type {IRoom, IRoomStates} from "./room";
import makeRoom, {ROOM_STATES} from "./room";

const LIVE_ROOMS = new Map<string, IRoom>();

let idCounter = -1;

export interface IAuthenticatedRoomConnection {
    readonly room: IRoom;

    readonly user: IUser;
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

export async function requireAuthenticatedAttendeeConnection(
    request: Request,
    roomID: string,
): Promise<IAuthenticatedRoomConnection> {
    const {identifiable: user} = await requireAuthenticatedSession(request);

    const room = LIVE_ROOMS.get(roomID);

    if (!room) {
        throw data("Not Found", {
            status: 404,
        });
    }

    for (const attendee of room.attendees.values()) {
        // **TODO:** We should probably create a a direct lookup for by user id...
        // but this is good enough to now. ¯\_(ツ)_/¯
        if (attendee.user.id === user.id) {
            // **HACK:** The deconstructor callback for `eventStream` is not called
            // properly by Vite's development server.
            //
            // So, we have to be slightly more leient here and just dispose of the
            // the existing connection to make development mode easier.
            if (APP_IS_PRODUCTION) {
                throw data("Conflict", {
                    status: 409,
                });
            } else {
                attendee._dispose();
            }

            break;
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
): Promise<IAuthenticatedRoomConnection> {
    const {identifiable: user} = await requireAuthenticatedSession(request);

    const room = LIVE_ROOMS.get(roomID);

    if (!room) {
        throw data("Not Found", {
            status: 404,
        });
    }

    let hasAttendee: boolean = false;

    for (const attendee of room.attendees.values()) {
        if (attendee.user.id === user.id) {
            hasAttendee = true;
            break;
        }
    }

    if (!hasAttendee) {
        // **NOTE:** While a `403` would be more appropriate, we do not want our
        // room IDs to be enumerable by external clients.
        //
        // Similarly to how services return not found errors when responding to
        // username + password login attempts. This is to prevent information
        // leakage for the "semi-private" room IDs.
        throw data("Not Found", {
            status: 404,
        });
    }

    return {
        room,
        user,
    };
}

export async function requireAuthenticatedDisplayConnection(
    request: Request,
    roomID: string,
): Promise<IAuthenticatedRoomConnection> {
    const {identifiable: user} = await requireAuthenticatedSession(request);

    const room = LIVE_ROOMS.get(roomID);

    if (!room) {
        throw data("Not Found", {
            status: 404,
        });
    }

    return {
        room,
        user,
    };
}

export async function requireAuthenticatedPresenterConnection(
    request: Request,
    roomID: string,
): Promise<IAuthenticatedRoomConnection> {
    const {identifiable: user} = await requireAuthenticatedSession(request);

    const room = LIVE_ROOMS.get(roomID);

    if (
        !room ||
        // **NOTE:** See comment for `requireAuthenticatedAttendeeSession`.
        room.presenter.id !== user.id
    ) {
        throw data("Not Found", {
            status: 404,
        });
    }

    if (room.presenterEntity) {
        // **HACK:** See the similar comment for
        // `requireAuthenticatedAttendeeConnection`.
        if (APP_IS_PRODUCTION) {
            throw data("Conflict", {
                status: 409,
            });
        } else {
            room.presenterEntity._dispose();
        }
    }

    return {
        room,
        user,
    };
}

export async function requireAuthenticatedPresenterSession(
    request: Request,
    roomID: string,
): Promise<IAuthenticatedRoomConnection> {
    const {identifiable: user} = await requireAuthenticatedSession(request);

    const room = LIVE_ROOMS.get(roomID);

    if (!room || room.presenter.id !== user.id) {
        throw data("Not Found", {
            status: 404,
        });
    }

    return {
        room,
        user,
    };
}
