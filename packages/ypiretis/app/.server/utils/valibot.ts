import {CronPattern} from "croner";

import * as v from "valibot";

export const cron_expression = v.pipe(
    v.string(),
    v.check((value) => {
        try {
            new CronPattern(value);
        } catch (error) {
            return false;
        }

        return true;
    }, "Invalid cron expression format."),
);
