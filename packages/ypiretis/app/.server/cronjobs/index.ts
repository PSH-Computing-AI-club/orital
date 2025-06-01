import {Cron} from "croner";

import CronjobTokensCleanup, {
    CRONJOB_DURATION as CRONJOB_DURATION_TOKENS_CLEANUP,
} from "./tokens_cleanup";

export type ICronjobsDisposeFunc = () => void;

const CRONJOBS = [
    {callback: CronjobTokensCleanup, duration: CRONJOB_DURATION_TOKENS_CLEANUP},
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
