import {Temporal} from "@js-temporal/polyfill";

import * as v from "valibot";

import {findAllPublished} from "~/.server/services/events_service";
import {SORT_MODES} from "~/.server/services/crud_service";
import {and, gte, lt} from "~/.server/services/crud_service.filters";
import {renderMarkdownForPlaintext} from "~/.server/services/markdown";

import DatetimeText from "~/components/common/datetime_text";
import Title from "~/components/common/title";

import ContentSection from "~/components/frontpage/content_section";
import FeedCard from "~/components/frontpage/feed_card";
import FeedStack from "~/components/frontpage/feed_stack";
import PageHero from "~/components/frontpage/page_hero";

import {validateParams} from "~/guards/validation";

import {SERVER_TIMEZONE} from "~/utils/constants";
import {formatCalendarTimestamp} from "~/utils/locale";
import {NAVIGATOR_TIMEZONE} from "~/utils/navigator";
import {normalizeSpacing, truncateTextRight} from "~/utils/string";
import {number} from "~/utils/valibot";

import {Route} from "./+types/_frontpage_.calendar.($year).($month)";

const EVENT_DESCRIPTION_CHARACTER_LIMIT = 192;

const LOADER_PARAMS_SCHEMA = v.object({
    month: v.optional(number),

    year: v.optional(number),
});

export async function loader(loaderArgs: Route.LoaderArgs) {
    let {month = null, year = null} = validateParams(
        LOADER_PARAMS_SCHEMA,
        loaderArgs,
    );

    if (month === null || year === null) {
        const {month: currentMonth, year: currentYear} =
            Temporal.Now.zonedDateTimeISO(SERVER_TIMEZONE);

        month ??= currentMonth;
        year ??= currentYear;
    }

    const startDate = Temporal.PlainDate.from({year, month, day: 1});
    const endDate = startDate.add({months: 1});

    const zonedStartDate = startDate
        .toZonedDateTime({
            timeZone: SERVER_TIMEZONE,
        })
        .toInstant();

    const zonedEndDate = endDate
        .toZonedDateTime({
            timeZone: SERVER_TIMEZONE,
        })
        .toInstant();

    const events = await findAllPublished({
        sort: {
            by: "publishedAt",
            mode: SORT_MODES.descending,
        },

        where: and(
            gte("publishedAt", zonedStartDate),
            lt("publishedAt", zonedEndDate),
        ),
    });

    const mappedEvents = await Promise.all(
        events.map(async (event) => {
            const {content, eventID, slug, publishedAt, title} = event;

            const zonedPublishedAt =
                publishedAt.toZonedDateTimeISO(NAVIGATOR_TIMEZONE);

            const plaintextContent = await renderMarkdownForPlaintext(content);
            const description = normalizeSpacing(
                truncateTextRight(
                    plaintextContent,
                    EVENT_DESCRIPTION_CHARACTER_LIMIT,
                ),
            );

            const {epochMilliseconds: publishedAtTimestamp} = publishedAt;
            const {year, month, day} = zonedPublishedAt;

            return {
                day,
                description,
                eventID,
                month,
                publishedAtTimestamp,
                slug,
                title,
                year,
            };
        }),
    );

    return {
        calendar: {
            timestamp: zonedStartDate.epochMilliseconds,
        },

        events: mappedEvents,
    };
}

export default function FrontpageNews(props: Route.ComponentProps) {
    const {loaderData} = props;
    const {calendar, events} = loaderData;

    const {timestamp} = calendar;

    const timestampText = formatCalendarTimestamp(timestamp);

    return (
        <>
            <Title title={`${timestampText} :: /calendar`} />

            <PageHero.Root>
                <PageHero.Container>
                    <PageHero.Text>/calendar</PageHero.Text>
                </PageHero.Container>
            </PageHero.Root>

            <ContentSection.Root>
                <ContentSection.Container>
                    <ContentSection.Header>
                        <ContentSection.Title>
                            {timestampText}
                        </ContentSection.Title>
                    </ContentSection.Header>

                    <FeedStack.Root>
                        {events.map((event) => {
                            const {
                                day,
                                description,
                                eventID,
                                month,
                                publishedAtTimestamp,
                                title,
                                slug,
                                year,
                            } = event;

                            return (
                                <FeedStack.Item key={eventID}>
                                    <FeedCard.Root>
                                        <FeedCard.Body>
                                            <FeedCard.Title
                                                to={`/calendar/events/${eventID}/${year}/${month}/${day}/${slug}`}
                                            >
                                                {title}
                                            </FeedCard.Title>

                                            <FeedCard.Description>
                                                <DatetimeText
                                                    detail="short"
                                                    timestamp={
                                                        publishedAtTimestamp
                                                    }
                                                />
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
                </ContentSection.Container>
            </ContentSection.Root>
        </>
    );
}
