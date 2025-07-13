import {data} from "react-router";

import * as v from "valibot";

import {findAllPublished} from "~/.server/services/articles_service";
import {renderMarkdownForPlaintext} from "~/.server/services/markdown";

import {FORMAT_DETAIL, formatZonedDateTime} from "~/.server/utils/locale";
import {SYSTEM_TIMEZONE} from "~/.server/utils/temporal";
import {transformTextToSnippet} from "~/.server/utils/string";

import FeedCard from "~/components/frontpage/feed_card";
import FrontpageShell from "~/components/frontpage/frontpage_shell";
import PageHero from "~/components/frontpage/page_hero";

import {Route} from "./+types/_frontpage_.news.($page)";

const ARTICLES_PER_PAGE = 25;

const ARTICLE_DESCRIPTION_CHARACTER_LIMIT = 48;

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
            const {articleID, content, slug, publishedAt, title} = article;

            const publishedAtTimestamp = formatZonedDateTime(
                publishedAt.toZonedDateTimeISO(SYSTEM_TIMEZONE),
                {
                    detail: FORMAT_DETAIL.short,
                },
            );

            const plaintextContent = await renderMarkdownForPlaintext(content);
            const description = transformTextToSnippet(plaintextContent, {
                limit: ARTICLE_DESCRIPTION_CHARACTER_LIMIT,
            });

            return {
                articleID,
                description,
                publishedAtTimestamp,
                slug,
                title,
            };
        }),
    );

    return {
        articles: mappedArticles,
        pagination,
    };
}

export default function FrontpageNews(props: Route.ComponentProps) {
    const {loaderData} = props;
    const {articles, pagination} = loaderData;

    return (
        <>
            <FrontpageShell.Title title="/news" />

            <PageHero.Root>
                <PageHero.Container>
                    <PageHero.Text>/news</PageHero.Text>
                </PageHero.Container>
            </PageHero.Root>

            {articles.map((article) => {
                const {articleID, description, publishedAtTimestamp, title} =
                    article;

                return (
                    <FeedCard.Root key={articleID}>
                        <FeedCard.Body>
                            <FeedCard.Title>{title}</FeedCard.Title>

                            <FeedCard.Description>
                                {publishedAtTimestamp}
                            </FeedCard.Description>

                            <FeedCard.Text>{description}</FeedCard.Text>
                        </FeedCard.Body>
                    </FeedCard.Root>
                );
            })}
        </>
    );
}
