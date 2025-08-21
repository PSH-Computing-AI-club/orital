import {Flex} from "@chakra-ui/react";

import {data, redirect, useLoaderData} from "react-router";

import * as v from "valibot";

import {eq} from "~/.server/services/crud_service.filters";
import {findOnePublished} from "~/.server/services/events_service";
import {renderMarkdownForWeb} from "~/.server/services/markdown";

import {slug, ulid} from "~/.server/utils/valibot";

import DatetimeText from "~/components/common/datetime_text";
import DatetimeRangeText from "~/components/common/datetime_range_text";
import Title from "~/components/common/title";

import ContentSection from "~/components/frontpage/content_section";
import PageHero from "~/components/frontpage/page_hero";

import CalendarTextIcon from "~/components/icons/calendar_text_icon";
import PinIcon from "~/components/icons/pin_icon";

import {validateParams} from "~/guards/validation";

import {SERVER_TIMEZONE} from "~/utils/constants";
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
        endAt,
        location,
        slug: articleSlug,
        startAt,
        title,
        updatedAt,
    } = event;

    const zonedStartAt = startAt.toZonedDateTimeISO(SERVER_TIMEZONE);

    const {day: startDay, month: startMonth, year: startYear} = zonedStartAt;

    if (
        articleSlug !== inputSlug ||
        startDay !== inputDay ||
        startMonth !== inputMonth ||
        startYear !== inputYear
    ) {
        return redirect(
            `/calendar/events/${eventID}/${startYear}/${startMonth}/${startDay}/${articleSlug}`,
            {
                status: 301,
            },
        );
    }

    const endAtTimestamp = endAt?.epochMilliseconds ?? null;
    const {epochMilliseconds: startAtTimestamp} = startAt;

    const updatedAtTimestamp = hasBeenEdited
        ? updatedAt.epochMilliseconds
        : null;

    const renderedContent = await renderMarkdownForWeb(content);

    return {
        event: {
            eventID,
            endAtTimestamp,
            location,
            renderedContent,
            startAtTimestamp,
            title,
            updatedAtTimestamp,
        },
    };
}

function DateAndTimeDetails() {
    const {event} = useLoaderData<typeof loader>();
    const {endAtTimestamp, startAtTimestamp} = event;

    return (
        <Flex lineHeight="shorter">
            <CalendarTextIcon />
            &nbsp;
            {endAtTimestamp ? (
                <DatetimeRangeText
                    startAtTimestamp={startAtTimestamp}
                    endAtTimestamp={endAtTimestamp}
                />
            ) : (
                <DatetimeText timestamp={startAtTimestamp} />
            )}
        </Flex>
    );
}

function LocationDetails() {
    const {event} = useLoaderData<typeof loader>();
    const {location} = event;

    return (
        <Flex lineHeight="shorter">
            <PinIcon />
            &nbsp;
            {location ?? "TBD"}
        </Flex>
    );
}

function EventDetails() {
    return (
        <>
            <DateAndTimeDetails />
            <LocationDetails />
        </>
    );
}

export default function FrontpageNewsArticle(props: Route.ComponentProps) {
    const {loaderData} = props;
    const {event} = loaderData;

    const {renderedContent, title} = event;

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
                            <EventDetails />
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
