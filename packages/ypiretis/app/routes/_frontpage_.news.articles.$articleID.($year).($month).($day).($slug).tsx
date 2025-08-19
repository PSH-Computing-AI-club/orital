import {Avatar, Span} from "@chakra-ui/react";

import {data, redirect} from "react-router";

import * as v from "valibot";

import {findOnePublishedWithPoster} from "~/.server/services/articles_service";
import {eq} from "~/.server/services/crud_service.filters";
import {renderMarkdownForWeb} from "~/.server/services/markdown";

import {slug, ulid} from "~/.server/utils/valibot";

import DatetimeText from "~/components/common/datetime_text";
import Links from "~/components/common/links";
import Title from "~/components/common/title";

import ContentSection from "~/components/frontpage/content_section";
import PageHero from "~/components/frontpage/page_hero";

import {validateParams} from "~/guards/validation";

import {ACCOUNT_PROVIDER_DOMAIN, SERVER_TIMEZONE} from "~/utils/constants";
import {number} from "~/utils/valibot";

import {Route} from "./+types/_frontpage_.news.articles.$articleID.($year).($month).($day).($slug)";

const LOADER_PARAMS_SCHEMA = v.object({
    articleID: ulid,

    day: v.optional(number),

    month: v.optional(number),

    slug: v.optional(slug),

    year: v.optional(number),
});

export async function loader(loaderArgs: Route.LoaderArgs) {
    const {
        articleID,
        day: inputDay = null,
        month: inputMonth = null,
        slug: inputSlug = null,
        year: inputYear = null,
    } = validateParams(LOADER_PARAMS_SCHEMA, loaderArgs);

    const article = await findOnePublishedWithPoster({
        where: eq("articleID", articleID),
    });

    if (article === null) {
        throw data("Not Found", {
            status: 404,
        });
    }

    const {
        content,
        hasBeenEdited,
        poster,
        publishedAt,
        slug: articleSlug,
        title,
        updatedAt,
    } = article;
    const {accountID, firstName, lastName} = poster;

    const zonedPublishedAt = publishedAt.toZonedDateTimeISO(SERVER_TIMEZONE);

    const {
        day: publishedDay,
        month: publishedMonth,
        year: publishedYear,
    } = zonedPublishedAt;

    if (
        articleSlug !== inputSlug ||
        publishedDay !== inputDay ||
        publishedMonth !== inputMonth ||
        publishedYear !== inputYear
    ) {
        return redirect(
            `/news/articles/${articleID}/${publishedYear}/${publishedMonth}/${publishedDay}/${articleSlug}`,
            {
                status: 301,
            },
        );
    }

    const {epochMilliseconds: publishedAtTimestamp} = publishedAt;
    const updatedAtTimestamp = hasBeenEdited
        ? updatedAt.epochMilliseconds
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
                    <ContentSection.Header>
                        <ContentSection.Title>{title}</ContentSection.Title>

                        <ContentSection.Description>
                            <Avatar.Root blockSize="1.75em" inlineSize="1.75em">
                                <Avatar.Fallback name={fullName} />

                                <Avatar.Image
                                    src={avatarSrc}
                                    alt={`Avatar that represents ${fullName}.`}
                                />
                            </Avatar.Root>
                            <address>
                                <Span whiteSpace="pre"> {fullName} </Span>
                                <Links.MailToLink
                                    variant="prose"
                                    to={email}
                                    fontSize="sm"
                                >
                                    {email}
                                </Links.MailToLink>
                            </address>
                            &nbsp;
                            <Span whiteSpace="pre">
                                • Published{" "}
                                <DatetimeText
                                    detail="long"
                                    timestamp={publishedAtTimestamp}
                                />
                            </Span>
                            {updatedAtTimestamp ? (
                                <>
                                    &nbsp;
                                    <Span whiteSpace="pre">
                                        • Updated{" "}
                                        <DatetimeText
                                            detail="long"
                                            timestamp={updatedAtTimestamp}
                                        />
                                    </Span>
                                </>
                            ) : undefined}
                        </ContentSection.Description>
                    </ContentSection.Header>

                    <ContentSection.Prose
                        dangerouslySetInnerHTML={{__html: renderedContent}}
                    />
                </ContentSection.Container>
            </ContentSection.Root>
        </>
    );
}
