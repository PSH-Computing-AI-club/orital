import type {ActionFunctionArgs, LoaderFunctionArgs} from "react-router";
import {data} from "react-router";

import type {
    ErrorMessage,
    InferOutput,
    ObjectEntries,
    ObjectIssue,
    ObjectSchema,
    VariantSchema,
} from "valibot";
import * as v from "valibot";

export type IObjectSchema = ObjectSchema<
    ObjectEntries,
    ErrorMessage<ObjectIssue> | undefined
>;

export type IObjectLikeSchema =
    | IObjectSchema
    | VariantSchema<string, IObjectSchema[], undefined>;

export async function validateFormData<T extends IObjectLikeSchema>(
    schema: T,
    actionArgs: ActionFunctionArgs,
    errorData: unknown = "Bad Request",
): Promise<InferOutput<T>> {
    const {request} = actionArgs;

    const formData = await request.formData();

    const {output, success} = v.safeParse(
        schema,
        Object.fromEntries(formData.entries()),
    );

    if (!success) {
        throw data(errorData, {
            status: 400,
        });
    }

    return output;
}

export function validateParams<T extends IObjectLikeSchema>(
    schema: T,
    requestArgs: ActionFunctionArgs | LoaderFunctionArgs,
    errorData: unknown = "Bad Request",
): InferOutput<T> {
    const {params: unsafeParams} = requestArgs;

    const {output, success} = v.safeParse(schema, unsafeParams);

    if (!success) {
        throw data(errorData, {
            status: 400,
        });
    }

    return output;
}
