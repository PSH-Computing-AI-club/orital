import {data} from "react-router";

import * as v from "valibot";

import {validateMultipartFormData} from "~/.server/guards/validation";

import {updateOneByArticleID} from "~/.server/services/articles_service";
import {handleFile} from "~/.server/services/uploads_service";
import {requireAuthenticatedAdminSession} from "~/.server/services/users_service";

import {bunFile} from "~/.server/utils/valibot";

import {validateParams} from "~/guards/validation";

import {Route} from "./+types/admin_.news_.articles_.$articleID_.actions_.upload";

const ACTION_PARAMS_SCHEMA = v.object({
    articleID: v.pipe(v.string(), v.ulid()),
});

const ACTION_FORM_DATA_SCHEMA = v.object({
    action: v.pipe(v.string(), v.literal("upload.file")),

    file: v.pipe(v.file(), v.maxSize(1024 ** 2 * 5), bunFile),
});

export type IActionFormDataSchema = v.InferInput<
    typeof ACTION_FORM_DATA_SCHEMA
>;

export async function action(actionArgs: Route.ActionArgs) {
    const {articleID} = validateParams(ACTION_PARAMS_SCHEMA, actionArgs);

    // **NOTE:** Normally we handle parsing and validating _before_
    // authentication since authentication requires a database hit.
    //
    // However, since we accept file uploads at this endpoint we want to
    // reject those requests to those immediately as soon as possible instead.
    //
    // Since attackers could fill up our disk before even checking if they
    // were allowed to in the first place.

    const {identifiable: user} =
        await requireAuthenticatedAdminSession(actionArgs);

    const {file} = await validateMultipartFormData(
        ACTION_FORM_DATA_SCHEMA,
        actionArgs,
    );

    const upload = await handleFile(file, user);

    console.log({
        upload,
    });
}
