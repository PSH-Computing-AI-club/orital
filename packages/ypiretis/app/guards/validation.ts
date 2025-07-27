// **IMPORTANT:** Do **NOT** use absolute imports in this module. It is
// imported by server-only modules.

import type {BunFile} from "bun";

import type {FileUploadHandler} from "@remix-run/form-data-parser";
import {
    FormDataParseError,
    MaxFileSizeExceededError,
    MaxHeaderSizeExceededError,
    MaxFilesExceededError,
    MultipartParseError,
    parseFormData,
} from "@remix-run/form-data-parser";

import type {
    ActionFunctionArgs,
    ClientActionFunctionArgs,
    ClientLoaderFunctionArgs,
    LoaderFunctionArgs,
} from "react-router";
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

import {handleFileUpload} from "~/.server/services/temporary_service";

export type IObjectSchema = ObjectSchema<
    ObjectEntries,
    ErrorMessage<ObjectIssue> | undefined
>;

export type IObjectLikeSchema =
    | IObjectSchema
    | VariantSchema<string, IObjectSchema[], undefined>;

export async function validateFormData<T extends IObjectLikeSchema>(
    schema: T,
    actionArgs: ActionFunctionArgs | ClientActionFunctionArgs,
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

export async function validateMultipartFormData<T extends IObjectSchema>(
    schema: T,
    actionArgs: ActionFunctionArgs | ClientActionFunctionArgs,
    errorData: unknown = "Bad Request",
): Promise<InferOutput<T>> {
    const {request} = actionArgs;
    const {entries} = schema;

    const fileUploadFields = new Set(
        Object.entries(entries)
            .filter((entry, _index) => {
                const [, fieldSchema] = entry;
                const {type} = fieldSchema;

                return type === "file";
            })
            .map((entry, _index) => {
                const [fieldName] = entry;

                return fieldName;
            }),
    );

    let fileIndex = 0;
    const uploadedFiles: BunFile[] = Array.from({
        length: fileUploadFields.size,
    });

    const onFileCleanup = async (): Promise<void> => {
        await Promise.all(
            uploadedFiles.map((file, _index) => {
                if (!file) {
                    return null;
                }

                return file.unlink();
            }),
        );
    };

    const onFileUpload = (async (fileUpload) => {
        const {fieldName} = fileUpload;

        if (!fileUploadFields.has(fieldName)) {
            // todo: do something here
        }

        const file = await handleFileUpload(fileUpload);
        uploadedFiles[fileIndex] = file;

        fileIndex++;
        return file;
    }) satisfies FileUploadHandler;

    let formData: FormData;

    try {
        formData = await parseFormData(
            request,
            {
                // **NOTE:** We should enforce a upload-per-request model globally. There
                // is at no endpoint where we would actually need to ingest multiple files
                // at any given point. Plus, this helps simplifies things.
                maxFiles: 1,
            },

            onFileUpload,
        );
    } catch (error) {
        await onFileCleanup();

        if (
            error instanceof FormDataParseError ||
            error instanceof MaxFileSizeExceededError ||
            error instanceof MaxHeaderSizeExceededError ||
            error instanceof MaxFilesExceededError ||
            error instanceof MultipartParseError
        ) {
            throw data(errorData, {
                status: 400,
            });
        }

        throw error;
    }

    const {output, success} = v.safeParse(
        schema,
        Object.fromEntries(formData.entries()),
    );

    if (!success) {
        await onFileCleanup();

        throw data(errorData, {
            status: 400,
        });
    }

    return output;
}

export function validateParams<T extends IObjectLikeSchema>(
    schema: T,
    requestArgs:
        | ActionFunctionArgs
        | ClientActionFunctionArgs
        | ClientLoaderFunctionArgs
        | LoaderFunctionArgs,
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

export function validateSearchParams<T extends IObjectLikeSchema>(
    schema: T,
    requestArgs: ActionFunctionArgs | LoaderFunctionArgs,
    errorData: unknown = "Bad Request",
): InferOutput<T> {
    const {request} = requestArgs;

    const {searchParams} = new URL(request.url);

    const {output, success} = v.safeParse(
        schema,
        Object.fromEntries(searchParams.entries()),
    );

    if (!success) {
        throw data(errorData, {
            status: 400,
        });
    }

    return output;
}
