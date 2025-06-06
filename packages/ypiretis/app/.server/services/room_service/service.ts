import {data} from "react-router";

import {generatePIN} from "../../utils/crypto";

import type {IUser} from "../users_service";
import {requireAuthenticatedSession} from "../users_service";

import type {IRoom, IRoomStates} from "./room";
import makeRoom, {ROOM_STATES} from "./room";

const LIVE_ROOMS = new Map<string, IRoom>();

let idCounter = -1;

export interface IAuthenticatedRoomSession {
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

export function findOneLiveByPIN(pin: string): IRoom | null {
    return LIVE_ROOMS.get(pin) ?? null;
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
    const pin = generatePIN();

    // **TODO:** add to db

    const room = makeRoom({
        id,
        pin,
        presenter,
        state,
        title,
    });

    LIVE_ROOMS.set(room.pin, room);

    const pinUpdateSubscription = room.EVENT_PIN_UPDATE.subscribe((event) => {
        const {newPIN, oldPIN} = event;

        // **TODO:** update db pin

        LIVE_ROOMS.set(newPIN, room);
        LIVE_ROOMS.delete(oldPIN);
    });

    const titleUpdateSubscription = room.EVENT_TITLE_UPDATE.subscribe(
        (event) => {
            // **TODO:** update db title
        },
    );

    const stateUpdateSubscription = room.EVENT_STATE_UPDATE.subscribe(
        (event) => {
            const {newState} = event;

            if (newState === ROOM_STATES.disposed) {
                pinUpdateSubscription.dispose();
                stateUpdateSubscription.dispose();
                titleUpdateSubscription.dispose();

                LIVE_ROOMS.delete(room.pin);
            }

            // **TODO:** update db state
        },
    );

    return room;
}

export async function requireAuthenticatedSessionForAttendee(
    request: Request,
    pin: string,
): Promise<IAuthenticatedRoomSession> {
    const {identifiable: user} = await requireAuthenticatedSession(request);

    const room = LIVE_ROOMS.get(pin);

    if (!room) {
        throw data("Not Found", {
            status: 404,
        });
    }

    for (const attendee of room.attendees.values()) {
        // **TODO:** We should probably create a a direct lookup for by user id...
        // but this is good enough to now. ¯\_(ツ)_/¯
        if (attendee.user.id) {
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

export async function requireAuthenticatedSessionForDisplay(
    request: Request,
    pin: string,
): Promise<IAuthenticatedRoomSession> {
    const {identifiable: user} = await requireAuthenticatedSession(request);

    const room = LIVE_ROOMS.get(pin);

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

export async function requireAuthenticatedSessionForPresenter(
    request: Request,
    pin: string,
): Promise<IAuthenticatedRoomSession> {
    const {identifiable: user} = await requireAuthenticatedSession(request);

    const room = LIVE_ROOMS.get(pin);

    if (!room) {
        throw data("Not Found", {
            status: 404,
        });
    }

    if (room.presenter.id !== user.id) {
        // **NOTE:** While a `403` would be more appropriate, we do not want our
        // room PINs to be enumerable by external clients.
        //
        // Similarly to how services return not found errors when responding to
        // username + password login attempts. This is to prevent information
        // leakage for the "semi-private" room PINs.
        throw data("Not Found", {
            status: 404,
        });
    }

    if (room.presenterEntity) {
        throw data("Conflict", {
            status: 409,
        });
    }

    return {
        room,
        user,
    };
}
