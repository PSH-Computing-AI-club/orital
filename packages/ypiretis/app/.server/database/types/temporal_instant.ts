import {Temporal} from "@js-temporal/polyfill";

import {sql} from "drizzle-orm";
import {customType} from "drizzle-orm/sqlite-core";

export const DEFAULT_TEMPORAL_INSTANT = sql`(UNIXEPOCH('now', 'subsec') * 1000)`;

const temporalInstant = customType<{
    data: Temporal.Instant;
    driverData: number;
    config: undefined;
    default: boolean;
}>({
    dataType() {
        return "integer";
    },

    fromDriver(value) {
        return Temporal.Instant.fromEpochMilliseconds(value);
    },

    toDriver(value) {
        return value.epochMilliseconds;
    },
});

export default temporalInstant;
