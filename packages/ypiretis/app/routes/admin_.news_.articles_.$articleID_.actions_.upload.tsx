import {data} from "react-router";

import * as v from "valibot";

import BUILDTIME_ENVIRONMENT from "~/.server/configuration/buildtime_environment";

import {validateMultipartFormData} from "~/.server/guards/validation";

import {
    findOne,
    handleOneAttachmentByInternalID,
} from "~/.server/services/articles_service";
import {eq} from "~/.server/services/crud_service.filters";
import {requireAuthenticatedAdminSession} from "~/.server/services/users_service";

import {createTransaction} from "~/.server/state/transaction";

import {bunFile, ulid} from "~/.server/utils/valibot";

import {validateParams} from "~/guards/validation";

import {Route} from "./+types/admin_.news_.articles_.$articleID_.actions_.upload";

const {ARTICLES_ATTACHMENTS_MAX_FILE_SIZE} = BUILDTIME_ENVIRONMENT;

const ACTION_PARAMS_SCHEMA = v.object({
    articleID: ulid,
});

const ACTION_FORM_DATA_SCHEMA = v.object({
    action: v.literal("upload.file"),

    file: v.pipe(bunFile, v.maxSize(ARTICLES_ATTACHMENTS_MAX_FILE_SIZE)),
});

export type IActionFormData = v.InferInput<typeof ACTION_FORM_DATA_SCHEMA>;

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

    const article = await findOne({
        where: eq("articleID", articleID),
    });

    if (!article) {
        throw data("Not Found.", {
            status: 404,
        });
    }

    const {id: internalID} = article;

    await createTransaction(async () => {
        await handleOneAttachmentByInternalID(internalID, user, file);
    });
}
