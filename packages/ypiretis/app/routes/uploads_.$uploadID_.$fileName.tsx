import {join} from "node:path";

import {data} from "react-router";

import * as v from "valibot";

import ENVIRONMENT from "~/.server/configuration/environment";

import {ulid} from "~/.server/utils/valibot";

import {validateParams} from "~/guards/validation";

import {Route} from "./+types/uploads_.$uploadID_.$fileName";

const {UPLOADS_DIRECTORY_PATH} = ENVIRONMENT;

const LOADER_PARAMS_SCHEMA = v.object({
    fileName: v.string(),

    uploadID: ulid,
});

export async function loader(loaderArgs: Route.LoaderArgs) {
    const {fileName, uploadID} = validateParams(
        LOADER_PARAMS_SCHEMA,
        loaderArgs,
    );

    const uploadFilePath = join(UPLOADS_DIRECTORY_PATH, uploadID, fileName);
    const file = Bun.file(uploadFilePath);

    if (!(await file.exists())) {
        throw data("Not Found", {
            status: 404,
        });
    }

    return new Response(file);
}
