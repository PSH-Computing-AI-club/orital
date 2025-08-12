// **TODO:** Add robust logging.
// - amount of rooms cleared

import {Temporal} from "@js-temporal/polyfill";

import RUNTIME_ENVIRONMENT from "../configuration/runtime_environment";

import {findAllLive} from "../services/rooms_service";

const LIFETIME_TTL = RUNTIME_ENVIRONMENT.ROOMS_LIFETIME_TTL;

export const CRONJOB_SCHEDULE =
    RUNTIME_ENVIRONMENT.CRONJOB_ROOMS_LIFETIME_CLEANUP;

export default async function CronjobRoomsLifetimeCleanup() {
    const rooms = findAllLive();

    for (const room of rooms) {
        const {createdAt} = room;

        const now = Temporal.Now.instant();
        const expiresAt = createdAt.add(LIFETIME_TTL);

        if (Temporal.Instant.compare(expiresAt, now) === -1) {
            room.dispose();
        }
    }
}
