import {join} from "node:path";

import {data} from "react-router";

import * as v from "valibot";

import RUNTIME_ENVIRONMENT from "~/.server/configuration/runtime_environment";

import {boolean, ulid} from "~/.server/utils/valibot";

import {validateParams, validateSearchParams} from "~/guards/validation";

import {Route} from "./+types/uploads_.$uploadID_.$fileName";

const {UPLOADS_DIRECTORY_PATH} = RUNTIME_ENVIRONMENT;

const LOADER_PARAMS_SCHEMA = v.object({
    fileName: v.string(),

    uploadID: ulid,
});

const LOADER_SEARCH_PARAMS_SCHEMA = v.object({
    forceDownload: v.optional(boolean),
});

export async function loader(loaderArgs: Route.LoaderArgs) {
    const {fileName, uploadID} = validateParams(
        LOADER_PARAMS_SCHEMA,
        loaderArgs,
    );

    const {forceDownload = false} = validateSearchParams(
        LOADER_SEARCH_PARAMS_SCHEMA,
        loaderArgs,
    );

    const uploadFilePath = join(UPLOADS_DIRECTORY_PATH, uploadID, fileName);
    const file = Bun.file(uploadFilePath);

    if (!(await file.exists())) {
        throw data("Not Found", {
            status: 404,
        });
    }

    const headers = forceDownload
        ? ({
              "Content-Disposition": `attachment; filename="${fileName}"`,
          } satisfies HeadersInit)
        : undefined;

    return new Response(file, {
        headers,
    });
}
