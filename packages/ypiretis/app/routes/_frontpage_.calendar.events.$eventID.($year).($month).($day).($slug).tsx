import {Span} from "@chakra-ui/react";

import {data, redirect} from "react-router";

import * as v from "valibot";

import {eq} from "~/.server/services/crud_service.filters";
import {findOnePublished} from "~/.server/services/events_service";
import {renderMarkdownForWeb} from "~/.server/services/markdown";

import {slug, ulid} from "~/.server/utils/valibot";

import DatetimeText from "~/components/common/datetime_text";
import Title from "~/components/common/title";

import ContentSection from "~/components/frontpage/content_section";
import PageHero from "~/components/frontpage/page_hero";

import {validateParams} from "~/guards/validation";

import {NAVIGATOR_TIMEZONE} from "~/utils/navigator";
import {number} from "~/utils/valibot";

import {Route} from "./+types/_frontpage_.calendar.events.$eventID.($year).($month).($day).($slug)";

const LOADER_PARAMS_SCHEMA = v.object({
    day: v.optional(number),

    eventID: ulid,

    month: v.optional(number),

    slug: v.optional(slug),

    year: v.optional(number),
});

export async function loader(loaderArgs: Route.LoaderArgs) {
    const {
        day: inputDay = null,
        eventID,
        month: inputMonth = null,
        slug: inputSlug = null,
        year: inputYear = null,
    } = validateParams(LOADER_PARAMS_SCHEMA, loaderArgs);

    const event = await findOnePublished({
        where: eq("eventID", eventID),
    });

    if (event === null) {
        throw data("Not Found", {
            status: 404,
        });
    }

    const {
        content,
        hasBeenEdited,
        publishedAt,
        slug: articleSlug,
        title,
        updatedAt,
    } = event;

    const zonedPublishedAt = publishedAt.toZonedDateTimeISO(NAVIGATOR_TIMEZONE);

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
            `/calendar/events/${eventID}/${publishedYear}/${publishedMonth}/${publishedDay}/${articleSlug}`,
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
        event: {
            eventID,
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
    const {event} = loaderData;

    const {publishedAtTimestamp, renderedContent, title, updatedAtTimestamp} =
        event;

    return (
        <>
            <Title title={`${title} :: /calendar`} />

            <PageHero.Root>
                <PageHero.Container>
                    <PageHero.Text>/calendar</PageHero.Text>
                </PageHero.Container>
            </PageHero.Root>

            <ContentSection.Root>
                <ContentSection.Container as="article">
                    <ContentSection.Header>
                        <ContentSection.Title>{title}</ContentSection.Title>

                        <ContentSection.Description>
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
