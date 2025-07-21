import {data} from "react-router";

import * as v from "valibot";

import {findAllPublished} from "~/.server/services/articles_service";
import {renderMarkdownForPlaintext} from "~/.server/services/markdown";

import {FORMAT_DETAIL, formatZonedDateTime} from "~/.server/utils/locale";
import {SYSTEM_TIMEZONE} from "~/.server/utils/temporal";
import {transformTextToSnippet} from "~/.server/utils/string";

import type {IPaginationTemplate} from "~/components/common/pagination";
import Title from "~/components/common/title";

import ContentSection from "~/components/frontpage/content_section";
import FeedCard from "~/components/frontpage/feed_card";
import FeedStack from "~/components/frontpage/feed_stack";
import PageHero from "~/components/frontpage/page_hero";

import {validateParams} from "~/guards/validation";

import {Route} from "./+types/_frontpage_.news.($page)";

const ARTICLES_PER_PAGE = 10;

const ARTICLE_DESCRIPTION_CHARACTER_LIMIT = 192;

const PAGINATION_PAGE_RANGE = 3;

const PAGINATION_URL_TEMPLATE = (({page}) =>
    `/news/${page}`) satisfies IPaginationTemplate;

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

            const zonedPublishedAt =
                publishedAt.toZonedDateTimeISO(SYSTEM_TIMEZONE);

            const publishedAtText = formatZonedDateTime(zonedPublishedAt, {
                detail: FORMAT_DETAIL.short,
            });

            const publishedAtTimestamp = zonedPublishedAt.toString({
                timeZoneName: "never",
            });

            const plaintextContent = await renderMarkdownForPlaintext(content);
            const description = transformTextToSnippet(plaintextContent, {
                limit: ARTICLE_DESCRIPTION_CHARACTER_LIMIT,
            });

            const {year, month, day} = zonedPublishedAt;

            return {
                articleID,
                day,
                description,
                month,
                publishedAtText,
                publishedAtTimestamp,
                slug,
                title,
                year,
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

    const {page, pages} = pagination;

    return (
        <>
            <Title title={`Page ${page} :: /news`} />

            <PageHero.Root>
                <PageHero.Container>
                    <PageHero.Text>/news</PageHero.Text>
                </PageHero.Container>
            </PageHero.Root>

            <ContentSection.Root>
                <ContentSection.Container>
                    <ContentSection.Header>
                        <ContentSection.Title>Page {page}</ContentSection.Title>
                    </ContentSection.Header>

                    <FeedStack.Root>
                        {articles.map((article) => {
                            const {
                                articleID,
                                day,
                                description,
                                month,
                                publishedAtText,
                                publishedAtTimestamp,
                                title,
                                slug,
                                year,
                            } = article;

                            return (
                                <FeedStack.Item key={articleID}>
                                    <FeedCard.Root>
                                        <FeedCard.Body>
                                            <FeedCard.Title
                                                to={`/news/articles/${articleID}/${year}/${month}/${day}/${slug}`}
                                            >
                                                {title}
                                            </FeedCard.Title>

                                            <FeedCard.Description>
                                                <time
                                                    dateTime={
                                                        publishedAtTimestamp
                                                    }
                                                >
                                                    {publishedAtText}
                                                </time>
                                            </FeedCard.Description>

                                            <FeedCard.Text>
                                                {description}
                                            </FeedCard.Text>
                                        </FeedCard.Body>
                                    </FeedCard.Root>
                                </FeedStack.Item>
                            );
                        })}
                    </FeedStack.Root>

                    <ContentSection.Pagination
                        currentPage={page}
                        pageRange={PAGINATION_PAGE_RANGE}
                        pages={pages}
                        template={PAGINATION_URL_TEMPLATE}
                    />
                </ContentSection.Container>
            </ContentSection.Root>
        </>
    );
}
