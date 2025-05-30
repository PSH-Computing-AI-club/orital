// **IMPORTANT:** Do **NOT** use absolute imports in this module. It is
// imported by server-only modules.

import * as v from "valibot";

import {isValid} from "ulid";

const EXPRESSION_ALPHABETIC = /^[A-Za-z]*$/u;

const EXPRESSION_ALPHANUMERICAL = /^[0-9A-Za-z]*$/u;

// SOURCE: https://github.com/fabian-hiller/valibot/issues/894#issuecomment-2763071920
const EXPRESSION_DOMAIN = /^(?!-)([a-z0-9-]{1,63}(?<!-)\.)+[a-z]{2,36}$/iu;

// SOURCE: https://rgxdb.com/r/MD2234J
const EXPRESSION_DURATION =
    /^(-?)P(?=\d|T\d)(?:(\d+)Y)?(?:(\d+)M)?(?:(\d+)([DW]))?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+(?:\.\d+)?)S)?)?$/;

const EXPRESSION_NUMERIC = /^[0-9]*$/;

export const alphabetic = v.regex(
    EXPRESSION_ALPHABETIC,
    "Invalid alphabetic format",
);

export const alphanumerical = v.regex(
    EXPRESSION_ALPHANUMERICAL,
    "Invalid alphanumerical format.",
);

export const domain = v.regex(EXPRESSION_DOMAIN, "Invalid domain format.");

export const duration = v.regex(
    EXPRESSION_DURATION,
    "Invalid duration format.",
);

export const hostname = v.union(
    [
        v.literal("localhost"),
        v.pipe(v.string(), domain),
        v.pipe(v.string(), v.ip()),
    ],
    "Invalid hostname format.",
);

export const numeric = v.regex(EXPRESSION_NUMERIC, "Invalid numeric format.");

export const token = (namespace: string) => {
    const prefix = `${namespace}_`;

    return v.pipe(
        v.string(),
        v.check((value) => {
            if (!value.startsWith(prefix)) {
                return false;
            }

            if (!isValid(value.slice(prefix.length))) {
                return false;
            }

            return true;
        }, "Invalid token format."),
    );
};
