import {Temporal} from "@js-temporal/polyfill";

import {data} from "react-router";

import * as v from "valibot";

import {
    ARTICLE_STATES,
    findOneByArticleID,
} from "~/.server/services/articles_service";
import {renderMarkdownForWeb} from "~/.server/services/markdown";

import {formatZonedDateTime} from "~/.server/utils/locale";
import {SYSTEM_TIMEZONE} from "~/.server/utils/temporal";

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

    const {content, slug, title, updatedAt} = article;

    const hasBeenEdited = updatedAt
        ? Temporal.Instant.compare(updatedAt, publishedAt) > 0
        : false;

    const publishedAtTimestamp = formatZonedDateTime(
        publishedAt.toZonedDateTimeISO(SYSTEM_TIMEZONE),
    );

    const updatedAtTimestamp = hasBeenEdited
        ? formatZonedDateTime(updatedAt!.toZonedDateTimeISO(SYSTEM_TIMEZONE))
        : null;

    const renderedContent = await renderMarkdownForWeb(content);

    return {
        article: {
            articleID,
            publishedAtTimestamp,
            renderedContent,
            slug,
            title,
            updatedAtTimestamp,
        },
    };
}

export default function FrontpageNewsArticle(props: Route.ComponentProps) {
    return "goodbye planet";
}
