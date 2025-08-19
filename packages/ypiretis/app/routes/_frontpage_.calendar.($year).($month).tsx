import {Temporal} from "@js-temporal/polyfill";

import {useMemo} from "react";

import * as v from "valibot";

import {findAllPublished} from "~/.server/services/events_service";
import {SORT_MODES} from "~/.server/services/crud_service";
import {and, gte, lt} from "~/.server/services/crud_service.filters";
import {renderMarkdownForPlaintext} from "~/.server/services/markdown";

import Title from "~/components/common/title";

import type {
    ICalendarGridEvent,
    ICalenderGridEventTemplate,
} from "~/components/frontpage/calendar_grid";
import {CalendarGrid} from "~/components/frontpage/calendar_grid";
import ContentSection from "~/components/frontpage/content_section";
import PageHero from "~/components/frontpage/page_hero";

import {validateParams} from "~/guards/validation";

import {SERVER_TIMEZONE} from "~/utils/constants";
import {useFormattedCalendarTimestamp} from "~/utils/locale";
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
                publishedAt.toZonedDateTimeISO(SERVER_TIMEZONE);

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

    const {epochMilliseconds: timestamp} = zonedStartDate;

    return {
        calendar: {
            month,
            timestamp,
            timezone: SERVER_TIMEZONE,
            year,
        },

        events: mappedEvents,
    };
}

export default function FrontpageNews(props: Route.ComponentProps) {
    const {loaderData} = props;
    const {calendar, events} = loaderData;

    const {month, timestamp, year, timezone} = calendar;
    const {isoTimestamp, textualTimestamp} = useFormattedCalendarTimestamp(
        timestamp,
        {timezone},
    );

    const calenderGridEvents = useMemo(() => {
        return events.map((event) => {
            const {
                description,
                eventID,
                month,
                publishedAtTimestamp,
                slug,
                title,
                year,
            } = event;

            const template = ((_context) => {
                return `/calendar/events/${eventID}/${year}/${month}/${slug}`;
            }) satisfies ICalenderGridEventTemplate;

            return {
                description,
                template,
                title,

                id: eventID,
                timestamp: publishedAtTimestamp,
            } satisfies ICalendarGridEvent;
        });
    }, [events]);

    return (
        <>
            <Title title={`${textualTimestamp} :: /calendar`} />

            <PageHero.Root>
                <PageHero.Container>
                    <PageHero.Text>/calendar</PageHero.Text>
                </PageHero.Container>
            </PageHero.Root>

            <ContentSection.Root>
                <ContentSection.Container>
                    <ContentSection.Header>
                        <ContentSection.Title>
                            <time dateTime={isoTimestamp}>
                                {textualTimestamp}
                            </time>
                        </ContentSection.Title>
                    </ContentSection.Header>

                    <CalendarGrid
                        events={calenderGridEvents}
                        month={month}
                        timezone={timezone}
                        year={year}
                    />
                </ContentSection.Container>
            </ContentSection.Root>
        </>
    );
}
