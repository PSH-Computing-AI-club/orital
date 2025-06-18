// **TODO:** Add robust logging.
// - amount of rooms cleared

import {Temporal} from "@js-temporal/polyfill";

import ENVIRONMENT from "../configuration/environment";

import {findAllLive} from "../services/rooms_service";

const DISCONNECT_TTL = ENVIRONMENT.ROOMS_DISCONNECT_TTL;

export const CRONJOB_DURATION = ENVIRONMENT.CRONJOB_ROOMS_DISCONNECT_CLEANUP;

export default async function CronjobRoomsDisconnectCleanup() {
    const rooms = findAllLive();

    for (const room of rooms) {
        const {presenterEntity, presenterLastDisposed} = room;

        if (presenterEntity) {
            continue;
        }

        const now = Temporal.Now.instant();
        const expiresAt = presenterLastDisposed.add(DISCONNECT_TTL);

        if (Temporal.Instant.compare(expiresAt, now) === -1) {
            room.dispose();
        }
    }
}
