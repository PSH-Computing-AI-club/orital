import {Cron} from "croner";

import CronjobRoomDisconnectCleanup, {
    CRONJOB_SCHEDULE as CRONJOB_SCHEDULE_ROOMS_DISCONNECT_CLEANUP,
} from "./rooms_disconnect_cleanup";
import CronjobRoomLifetimeCleanup, {
    CRONJOB_SCHEDULE as CRONJOB_SCHEDULE_ROOMS_LIFETIME_CLEANUP,
} from "./rooms_lifetime_cleanup";
import CronjobTokensCleanup, {
    CRONJOB_SCHEDULE as CRONJOB_SCHEDULE_TOKENS_CLEANUP,
} from "./tokens_cleanup";

const CRONJOBS = [
    {
        callback: CronjobRoomDisconnectCleanup,
        schedule: CRONJOB_SCHEDULE_ROOMS_DISCONNECT_CLEANUP,
    },

    {
        callback: CronjobRoomLifetimeCleanup,
        schedule: CRONJOB_SCHEDULE_ROOMS_LIFETIME_CLEANUP,
    },

    {
        callback: CronjobTokensCleanup,
        schedule: CRONJOB_SCHEDULE_TOKENS_CLEANUP,
    },
] satisfies {callback: () => Promise<void>; schedule: string}[];

export type ICronjobsDisposeFunc = () => void;

export default function startCronjobs(): ICronjobsDisposeFunc {
    // **TODO:** Add robust logging.
    // - start/end of job logging
    // - error handling logging
    // - overrun logging

    const cronjobs = CRONJOBS.map((cronjob) => {
        const {callback, schedule} = cronjob;

        return new Cron(schedule, {protect: true}, callback);
    });

    return () => {
        for (const cronjob of cronjobs) {
            cronjob.stop();
        }
    };
}
