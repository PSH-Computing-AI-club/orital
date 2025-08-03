import {data, redirect} from "react-router";

import * as v from "valibot";

import {findOnePublished} from "~/.server/services/articles_service";
import {eq} from "~/.server/services/crud_service.filters";

import {SYSTEM_TIMEZONE} from "~/.server/utils/temporal";
import {ulid} from "~/.server/utils/valibot";

import {validateParams} from "~/guards/validation";

import {Route} from "./+types/_frontpage_.news_.articles_.$articleID_.$";

const LOADER_PARAMS_SCHEMA = v.object({
    articleID: ulid,
});

export async function loader(loaderArgs: Route.LoaderArgs) {
    const {articleID} = validateParams(LOADER_PARAMS_SCHEMA, loaderArgs);

    const article = await findOnePublished({
        where: eq("articleID", articleID),
    });

    if (article === null) {
        throw data("Not Found", {
            status: 404,
        });
    }

    const {publishedAt, slug} = article;
    const {day, month, year} = publishedAt.toZonedDateTimeISO(SYSTEM_TIMEZONE);

    return redirect(
        `/news/articles/${articleID}/${year}/${month}/${day}/${slug}`,
        {
            status: 301,
        },
    );
}
