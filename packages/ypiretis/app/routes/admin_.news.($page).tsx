import {data} from "react-router";

import * as v from "valibot";

import {findAll} from "~/.server/services/articles_service";

import {FORMAT_DETAIL, formatZonedDateTime} from "~/.server/utils/locale";
import {SYSTEM_TIMEZONE} from "~/.server/utils/temporal";

import Layout from "~/components/controlpanel/layout";
import Title from "~/components/controlpanel/title";

import {validateParams} from "~/guards/validation";

import {Route} from "./+types/admin_.news.($page)";

const ARTICLES_PER_PAGE = 25;

const LOADER_PARAMS_SCHEMA = v.object({
    page: v.optional(
        v.pipe(
            v.string(),
            v.transform((value) => Number(value)),
            v.number(),
        ),
    ),
});

export async function loader(loaderArgs: Route.LoaderArgs) {
    const {page = 1} = validateParams(LOADER_PARAMS_SCHEMA, loaderArgs);

    const {articles, pagination} = await findAll({
        pagination: {
            page,

            limit: ARTICLES_PER_PAGE,
        },
    });

    const {pages} = pagination;

    if (page > pages) {
        throw data("Not Found", {
            status: 404,
        });
    }

    const mappedArticles = await Promise.all(
        articles.map(async (article) => {
            const {
                articleID,
                createdAt,
                poster,
                publishedAt,
                state,
                title,
                updatedAt,
            } = article;

            const {firstName, lastName} = poster;

            const zonedCreatedAt =
                createdAt.toZonedDateTimeISO(SYSTEM_TIMEZONE);

            const zonedUpdatedAt = publishedAt
                ? updatedAt.toZonedDateTimeISO(SYSTEM_TIMEZONE)
                : null;

            const zonedPublishedAt = publishedAt
                ? publishedAt.toZonedDateTimeISO(SYSTEM_TIMEZONE)
                : null;

            const createdAtText = formatZonedDateTime(zonedCreatedAt, {
                detail: FORMAT_DETAIL.short,
            });

            const publishedAtText = zonedPublishedAt
                ? formatZonedDateTime(zonedPublishedAt, {
                      detail: FORMAT_DETAIL.short,
                  })
                : null;

            const updatedAtText = zonedUpdatedAt
                ? formatZonedDateTime(zonedUpdatedAt, {
                      detail: FORMAT_DETAIL.short,
                  })
                : null;

            return {
                articleID,
                createdAtText,
                poster: {
                    firstName,
                    lastName,
                },
                publishedAtText,
                state,
                title,
                updatedAtText,
            };
        }),
    );

    return {
        articles: mappedArticles,
        pagination,
    };
}

export default function AdminNews(props: Route.ComponentProps) {
    const {loaderData} = props;
    const {articles} = loaderData;

    return (
        <Layout.FixedContainer>
            <Title.Text title="News Articles" />
            News index unda construction
        </Layout.FixedContainer>
    );
}
