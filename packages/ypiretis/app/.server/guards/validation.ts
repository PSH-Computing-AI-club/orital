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
>(
    schema: T,
    requestArgs: ActionFunctionArgs | LoaderFunctionArgs,
    errorData: unknown = "Bad Request",
) {
    const {params: unsafeParams} = requestArgs;

    const {output, success} = v.safeParse(schema, unsafeParams);

    if (!success) {
        throw data(errorData, {
            status: 400,
        });
    }

    return output;
}
