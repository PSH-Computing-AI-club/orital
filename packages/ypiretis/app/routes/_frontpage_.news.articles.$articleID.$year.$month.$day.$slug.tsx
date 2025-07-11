import {data} from "react-router";

import * as v from "valibot";

import {
    ARTICLE_STATES,
    findOneByArticleID,
} from "~/.server/services/articles_service";

import {Route} from "./+types/_frontpage_.news.articles.$articleID.$year.$month.$day.$slug";

const LOADER_PARAMS_SCHEMA = v.object({
    articleID: v.pipe(v.string(), v.ulid()),
});

export async function loader(loaderArgs: Route.LoaderArgs) {
    const {params: loaderParams} = loaderArgs;

    const {output: params, success} = v.safeParse(
        LOADER_PARAMS_SCHEMA,
        loaderParams,
    );

    if (!success) {
        throw data("Bad Request", {
            status: 400,
        });
    }

    const {articleID} = params;
    const article = await findOneByArticleID(articleID);

    if (article === null) {
        throw data("Not Found", {
            status: 404,
        });
    }

    const {publishedAt, state} = article;

    if (state !== ARTICLE_STATES.published || publishedAt === null) {
        throw data("Not Found", {
            status: 404,
        });
    }

    return {
        article,
    };
}

export default function FrontpageNewsArticle(props: Route.ComponentProps) {
    return "goodbye planet";
}
