import {Span} from "@chakra-ui/react";

import {Temporal} from "@js-temporal/polyfill";

import {data, redirect} from "react-router";

import * as v from "valibot";

import {findOnePublishedByArticleID} from "~/.server/services/articles_service";
import {renderMarkdownForWeb} from "~/.server/services/markdown";

import {formatZonedDateTime} from "~/.server/utils/locale";
import {SYSTEM_TIMEZONE} from "~/.server/utils/temporal";

import Title from "~/components/common/title";

import ContentSection from "~/components/frontpage/content_section";
import PageHero from "~/components/frontpage/page_hero";

import {Route} from "./+types/_frontpage_.news.articles.$articleID.$year.$month.$day.$slug";

const LOADER_PARAMS_SCHEMA = v.object({
    articleID: v.pipe(v.string(), v.ulid()),

    day: v.pipe(
        v.string(),
        v.transform((value) => Number(value)),
        v.number(),
    ),

    month: v.pipe(
        v.string(),
        v.transform((value) => Number(value)),
        v.number(),
    ),

    slug: v.pipe(v.string(), v.nonEmpty(), v.slug()),

    year: v.pipe(
        v.string(),
        v.transform((value) => Number(value)),
        v.number(),
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

    const {
        articleID,
        day: userDay,
        month: userMonth,
        slug: userSlug,
        year: userYear,
    } = params;

    const article = await findOnePublishedByArticleID(articleID);

    if (article === null) {
        throw data("Not Found", {
            status: 404,
        });
    }

    const {content, publishedAt, slug: articleSlug, title, updatedAt} = article;
    const zonedPublishedAt = publishedAt.toZonedDateTimeISO(SYSTEM_TIMEZONE);

    const {
        day: publishedDay,
        month: publishedMonth,
        year: publishedYear,
    } = zonedPublishedAt;

    if (
        articleSlug !== userSlug ||
        publishedDay !== userDay ||
        publishedMonth !== userMonth ||
        publishedYear !== userYear
    ) {
        return redirect(
            `/news/articles/${articleID}/${publishedYear}/${publishedMonth}/${publishedDay}/${articleSlug}`,
            {
                status: 301,
            },
        );
    }

    const publishedAtTimestamp = formatZonedDateTime(zonedPublishedAt);

    const hasBeenEdited = Temporal.Instant.compare(updatedAt, publishedAt) > 0;
    const updatedAtTimestamp = hasBeenEdited
        ? formatZonedDateTime(updatedAt.toZonedDateTimeISO(SYSTEM_TIMEZONE))
        : null;

    const renderedContent = await renderMarkdownForWeb(content);

    return {
        article: {
            articleID,
            publishedAtTimestamp,
            renderedContent,
            slug: articleSlug,
            title,
            updatedAtTimestamp,
        },
    };
}

export default function FrontpageNewsArticle(props: Route.ComponentProps) {
    const {loaderData} = props;
    const {article} = loaderData;

    const {publishedAtTimestamp, renderedContent, title, updatedAtTimestamp} =
        article;

    return (
        <>
            <Title title={`${title} :: /news`} />

            <PageHero.Root>
                <PageHero.Container>
                    <PageHero.Text>/news</PageHero.Text>
                </PageHero.Container>
            </PageHero.Root>

            <ContentSection.Root>
                <ContentSection.Container>
                    <ContentSection.Title>{title}</ContentSection.Title>

                    <ContentSection.Description>
                        <Span whiteSpace="pre">
                            • Published {publishedAtTimestamp}
                        </Span>

                        {updatedAtTimestamp ? (
                            <>
                                {" "}
                                <Span whiteSpace="pre">
                                    • Updated {updatedAtTimestamp}
                                </Span>
                            </>
                        ) : undefined}
                    </ContentSection.Description>

                    <ContentSection.Prose
                        dangerouslySetInnerHTML={{__html: renderedContent}}
                    />
                </ContentSection.Container>
            </ContentSection.Root>
        </>
    );
}
