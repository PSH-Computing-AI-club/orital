// **IMPORTANT:** Do **NOT** use absolute imports in this module. It is
// imported by server-only modules.

import {isValid} from "ulid";

import * as v from "valibot";

export const EXPRESSION_ALPHABETIC = /^[A-Za-z]*$/u;

export const EXPRESSION_ALPHANUMERICAL = /^[0-9A-Za-z]*$/u;

export const EXPRESSION_IDENTIFIER = /^[0-9A-Za-z\-]*$/u;

export const EXPRESSION_NUMERIC = /^[0-9]*$/;

export const EXPRESSION_PIN = /^[0-9A-NP-Z]*$/u;

export const EXPRESSION_TITLE = /^[0-9A-Za-z !-/:-@[-`{-~]*$/u;

export const list = v.pipe(
    v.string(),
    v.nonEmpty(),
    v.transform((value) =>
        value.split(",").map((substring) => substring.trim()),
    ),
);

export const number = v.pipe(
    v.string(),
    v.nonEmpty(),
    v.regex(EXPRESSION_NUMERIC, "Invalid numeric format."),
    v.transform((value) => {
        return Number(value);
    }),
);

export const alphabetic = v.pipe(
    v.string(),
    v.nonEmpty(),
    v.regex(EXPRESSION_ALPHABETIC, "Invalid alphabetic format"),
);

export const alphanumerical = v.pipe(
    v.string(),
    v.nonEmpty(),
    v.regex(EXPRESSION_ALPHANUMERICAL, "Invalid alphanumerical format."),
);

export const identifier = v.pipe(
    v.string(),
    v.nonEmpty(),
    v.regex(EXPRESSION_IDENTIFIER, "Invalid identifier format."),
);

export const email = v.pipe(v.string(), v.nonEmpty(), v.rfcEmail());

export const identifierList = v.pipe(list, v.array(identifier));

export const pin = v.pipe(
    v.string(),
    v.nonEmpty(),
    v.length(6),
    v.regex(EXPRESSION_PIN, "Invalid PIN format."),
);

export const title = v.pipe(
    v.string(),
    v.nonEmpty(),
    v.regex(EXPRESSION_TITLE, "Invalid title format."),
);

export const token = (namespace: string) => {
    const prefix = `${namespace}_`;

    return v.pipe(
        v.string(),
        v.nonEmpty(),
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

export const url = v.pipe(
    v.string(),
    v.nonEmpty(),
    v.url(),
    v.transform((value) => new URL(value)),
);
