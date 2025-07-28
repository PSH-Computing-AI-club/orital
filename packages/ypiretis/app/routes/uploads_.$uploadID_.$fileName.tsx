import {join} from "node:path";

import * as v from "valibot";

import ENVIRONMENT from "~/.server/configuration/environment";

import {validateParams} from "~/guards/validation";

import {Route} from "./+types/uploads_.$uploadID_.$fileName";

const {UPLOADS_DIRECTORY_PATH} = ENVIRONMENT;

const LOADER_PARAMS_SCHEMA = v.object({
    fileName: v.pipe(v.string()),

    uploadID: v.pipe(v.string(), v.ulid()),
});

export async function loader(loaderArgs: Route.LoaderArgs) {
    const {fileName, uploadID} = validateParams(
        LOADER_PARAMS_SCHEMA,
        loaderArgs,
    );

    const uploadFilePath = join(UPLOADS_DIRECTORY_PATH, uploadID, fileName);
    const file = Bun.file(uploadFilePath);

    return new Response(file);
}
