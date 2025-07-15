import {Avatar, Span} from "@chakra-ui/react";

import {Temporal} from "@js-temporal/polyfill";

import {data, redirect} from "react-router";

import * as v from "valibot";

import {findOnePublishedByArticleID} from "~/.server/services/articles_service";
import {renderMarkdownForWeb} from "~/.server/services/markdown";

import {formatZonedDateTime} from "~/.server/utils/locale";
import {SYSTEM_TIMEZONE} from "~/.server/utils/temporal";

import Links from "~/components/common/links";
import Title from "~/components/common/title";

import ContentSection from "~/components/frontpage/content_section";
import PageHero from "~/components/frontpage/page_hero";

import {ACCOUNT_PROVIDER_DOMAIN} from "~/utils/constants";

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

    const {
        content,
        poster,
        publishedAt,
        slug: articleSlug,
        title,
        updatedAt,
    } = article;
    const {accountID, firstName, lastName} = poster;

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

        poster: {
            accountID,
            firstName,
            lastName,
        },
    };
}

export default function FrontpageNewsArticle(props: Route.ComponentProps) {
    const {loaderData} = props;
    const {article, poster} = loaderData;

    const {publishedAtTimestamp, renderedContent, title, updatedAtTimestamp} =
        article;

    const {accountID, firstName, lastName} = poster;

    const avatarSrc = `/images/avatars.${accountID}.webp`;
    const fullName = `${firstName} ${lastName}`;
    const email = `${accountID}@${ACCOUNT_PROVIDER_DOMAIN}`;

    return (
        <>
            <Title title={`${title} :: /news`} />

            <PageHero.Root>
                <PageHero.Container>
                    <PageHero.Text>/news</PageHero.Text>
                </PageHero.Container>
            </PageHero.Root>

            <ContentSection.Root>
                <ContentSection.Container as="article">
                    <ContentSection.Title>{title}</ContentSection.Title>

                    <ContentSection.Description>
                        <Avatar.Root blockSize="6" inlineSize="6">
                            <Avatar.Fallback name={fullName} />

                            <Avatar.Image
                                src={avatarSrc}
                                alt={`Avatar that represents ${fullName}.`}
                            />
                        </Avatar.Root>
                        <Span whiteSpace="pre"> {fullName} </Span>
                        <Links.MailToLink
                            variant="prose"
                            to={email}
                            fontSize="sm"
                        >
                            {email}
                        </Links.MailToLink>
                        &nbsp;
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
