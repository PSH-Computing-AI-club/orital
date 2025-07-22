import {Temporal} from "@js-temporal/polyfill";

import {data} from "react-router";

import * as v from "valibot";

import {findOneByArticleID} from "~/.server/services/articles_service";

import {formatZonedDateTime} from "~/.server/utils/locale";

import Layout from "~/components/controlpanel/layout";

import {validateParams} from "~/guards/validation";

import {Route} from "./+types/admin_.news.articles.$articleID";
import {SYSTEM_TIMEZONE} from "~/.server/utils/temporal";

const LOADER_PARAMS_SCHEMA = v.object({
    articleID: v.pipe(v.string(), v.ulid()),
});

export async function loader(loaderArgs: Route.LoaderArgs) {
    const {articleID} = validateParams(LOADER_PARAMS_SCHEMA, loaderArgs);

    const article = await findOneByArticleID(articleID);

    if (article === null) {
        throw data("Not Found", {
            status: 404,
        });
    }

    const {
        hasBeenEdited,
        poster,
        publishedAt,
        slug: articleSlug,
        title,
        updatedAt,
    } = article;
    const {accountID, firstName, lastName} = poster;

    const zonedPublishedAt =
        publishedAt?.toZonedDateTimeISO(SYSTEM_TIMEZONE) ?? null;

    const zonedUpdatedAt = updatedAt.toZonedDateTimeISO(SYSTEM_TIMEZONE);

    const publishedAtText = zonedPublishedAt
        ? formatZonedDateTime(zonedPublishedAt)
        : null;

    const updatedAtText = hasBeenEdited
        ? formatZonedDateTime(zonedUpdatedAt)
        : null;

    return {
        article: {
            articleID,
            publishedAtText,
            slug: articleSlug,
            title,
            updatedAtText,
        },

        poster: {
            accountID,
            firstName,
            lastName,
        },
    };
}

export default function AdminNewsArticle(props: Route.ComponentProps) {
    const {loaderData} = props;
    const {article, poster} = loaderData;

    console.log({article, poster});

    return (
        <Layout.FixedContainer>
            News edit unda construction
        </Layout.FixedContainer>
    );
}
