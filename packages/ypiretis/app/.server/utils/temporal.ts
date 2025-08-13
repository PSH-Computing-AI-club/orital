import {Temporal} from "@js-temporal/polyfill";

export const UNIX_EPOCH = Temporal.PlainDate.from({
    month: 1,
    day: 1,
    year: 1970,
});
