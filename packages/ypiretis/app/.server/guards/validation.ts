import type {ActionFunctionArgs, LoaderFunctionArgs} from "react-router";
import {data} from "react-router";

import type {
    ErrorMessage,
    ObjectEntries,
    ObjectIssue,
    ObjectSchema,
} from "valibot";
import * as v from "valibot";

export function validateParams<
    T extends ObjectSchema<
        ObjectEntries,
        ErrorMessage<ObjectIssue> | undefined
    >,
>(schema: T, loaderArgs: ActionFunctionArgs | LoaderFunctionArgs) {
    const {params: unsafeParams} = loaderArgs;

    const {output: safeParams, success} = v.safeParse(schema, unsafeParams);

    if (!success) {
        throw data("Bad Request", {
            status: 400,
        });
    }

    return safeParams;
}
