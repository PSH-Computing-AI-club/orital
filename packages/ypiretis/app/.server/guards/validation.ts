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

import type {ActionFunctionArgs, ClientActionFunctionArgs} from "react-router";
import {data} from "react-router";

import type {InferOutput} from "valibot";
import * as v from "valibot";

import type {IObjectSchema} from "../../guards/validation";

import RUNTIME_ENVIRONMENT from "../configuration/runtime_environment";

import {handleFileUpload} from "../services/temporary_service";

const {UPLOADS_MAX_FILE_SIZE} = RUNTIME_ENVIRONMENT;

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
            throw ReferenceError(
                `bad arugment #0 to 'onFileUpload' (field name '${fieldName}' does not support files)`,
            );
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
                maxFileSize: UPLOADS_MAX_FILE_SIZE,
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
            error instanceof MultipartParseError ||
            error instanceof ReferenceError
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
