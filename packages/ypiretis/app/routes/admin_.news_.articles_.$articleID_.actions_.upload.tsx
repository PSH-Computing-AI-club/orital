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

export interface IActionFormDataSchema {
    readonly action: "upload.file";

    readonly file: File;
}

export async function action(actionArgs: Route.ActionArgs) {
    const {articleID} = validateParams(ACTION_PARAMS_SCHEMA, actionArgs);

    await requireAuthenticatedAdminSession(actionArgs);

    const {request} = actionArgs;

    const formData = await parseFormData(request, handleFileUpload);

    const {action, file} = Object.fromEntries(
        formData.entries() as IterableIterator<[string, FormDataEntryValue]>,
    );

    if (
        typeof action !== "string" ||
        action !== "upload.file" ||
        !(file instanceof Blob)
    ) {
        throw data("Bad Request.", {
            status: 400,
        });
    }
}
