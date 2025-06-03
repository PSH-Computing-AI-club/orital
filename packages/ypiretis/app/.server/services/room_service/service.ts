import type {IRoom, IRoomOptions} from "./room";
import makeRoom, {ROOM_STATES} from "./room";

const LIVE_ROOMS = new Map<string, IRoom>();

export function findAllLive(): IRoom[] {
    return Array.from(LIVE_ROOMS.values());
}

export function findOneLiveByPIN(pin: string): IRoom | null {
    return LIVE_ROOMS.get(pin) ?? null;
}

export async function insertOneLive(options: IRoomOptions): Promise<IRoom> {
    // **TODO:** add to db

    const room = makeRoom(options);
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
