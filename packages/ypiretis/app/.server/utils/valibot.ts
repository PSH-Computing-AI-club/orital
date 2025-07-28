import {CronPattern} from "croner";

import * as v from "valibot";

export const cronExpression = v.pipe(
    v.string(),
    v.check((value) => {
        try {
            new CronPattern(value);
        } catch (_error) {
            return false;
        }

        return true;
    }, "Invalid cron expression format."),
);
