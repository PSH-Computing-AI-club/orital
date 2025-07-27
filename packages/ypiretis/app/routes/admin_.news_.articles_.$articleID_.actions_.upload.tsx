import type {FormDataEntryValue} from "bun";

import type {FileUploadHandler} from "@remix-run/form-data-parser";
import {parseFormData} from "@remix-run/form-data-parser";

import {data} from "react-router";

import * as v from "valibot";

import {updateOneByArticleID} from "~/.server/services/articles_service";
import {handleFileUpload} from "~/.server/services/temporary_service";
import {requireAuthenticatedAdminSession} from "~/.server/services/users_service";

import {validateParams} from "~/guards/validation";

import {Route} from "./+types/admin_.news_.articles_.$articleID_.actions_.upload";

const ACTION_PARAMS_SCHEMA = v.object({
    articleID: v.pipe(v.string(), v.ulid()),
});

const ACTION_FORM_DATA_SCHEMA = v.object({
    action: v.pipe(v.string(), v.literal("upload.file")),

    file: v.pipe(v.file(), v.maxSize(1024 ** 2 * 5)),
});

export type IActionFormDataSchema = v.InferInput<
    typeof ACTION_FORM_DATA_SCHEMA
>;

export async function action(actionArgs: Route.ActionArgs) {
    const {articleID} = validateParams(ACTION_PARAMS_SCHEMA, actionArgs);

    await requireAuthenticatedAdminSession(actionArgs);

    const {request} = actionArgs;

    const formData = await parseFormData(request, handleFileUpload);

    const obj = Object.fromEntries(
        formData.entries() as IterableIterator<[string, FormDataEntryValue]>,
    );

    const {issues, output, success} = v.safeParse(ACTION_FORM_DATA_SCHEMA, obj);

    if (!success) {
        console.log({issues});

        throw data("Bad Request.", {
            status: 400,
        });
    }

    const {action, file} = output;

    console.log({
        action,
        file,
    });
}
