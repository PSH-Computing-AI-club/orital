import {Cron} from "croner";

import CronjobRoomDisconnectCleanup, {
    CRONJOB_DURATION as CRONJOB_DURATION_ROOMS_DISCONNECT_CLEANUP,
} from "./rooms_disconnect_cleanup";
import CronjobRoomLifetimeCleanup, {
    CRONJOB_DURATION as CRONJOB_DURATION_ROOMS_LIFETIME_CLEANUP,
} from "./rooms_lifetime_cleanup";
import CronjobTokensCleanup, {
    CRONJOB_DURATION as CRONJOB_DURATION_TOKENS_CLEANUP,
} from "./tokens_cleanup";

export type ICronjobsDisposeFunc = () => void;

const CRONJOBS = [
    {
        callback: CronjobRoomDisconnectCleanup,
        duration: CRONJOB_DURATION_ROOMS_DISCONNECT_CLEANUP,
    },

    {
        callback: CronjobRoomLifetimeCleanup,
        duration: CRONJOB_DURATION_ROOMS_LIFETIME_CLEANUP,
    },

    {
        callback: CronjobTokensCleanup,
        duration: CRONJOB_DURATION_TOKENS_CLEANUP,
    },
] satisfies {callback: () => Promise<void>; duration: string}[];

export default function startCronjobs(): ICronjobsDisposeFunc {
    // **TODO:** Add robust logging.
    // - start/end of job logging
    // - error handling logging
    // - overrun logging

    const cronjobs = CRONJOBS.map((cronjob) => {
        const {callback, duration} = cronjob;

        return new Cron(duration, {protect: true}, callback);
    });

    return () => {
        for (const cronjob of cronjobs) {
            cronjob.stop();
        }
    };
}
