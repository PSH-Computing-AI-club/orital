
import {data} from "react-router";

import * as v from "valibot";

import {findAllPublished} from "~/.server/services/articles_service";

import {Route} from "./+types/_frontpage_.news.($page)";

const ARTICLE_PAGE_LIMIT = 25;

const LOADER_PARAMS_SCHEMA = v.object({
    page: v.optional(
        v.pipe(
            v.string(),
            v.transform((value) => parseInt(value, 10)),
            v.number(),
        ),
    ),
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

    const {page = 1} = params;

    const {articles, pagination} = await findAllPublished({
        pagination: {
            page,

            limit: ARTICLE_PAGE_LIMIT,
        },
    });

    const {pages} = pagination;

    if (page > pages) {
        throw data("Not Found", {
            status: 404,
        });
    }

    return {
        articles,
        pagination,
    };
}

export default function FrontpageNews(props: Route.ComponentProps) {
    return "hello world";
}
