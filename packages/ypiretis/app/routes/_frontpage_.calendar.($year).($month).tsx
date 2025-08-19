import {Group, IconButton, Spacer} from "@chakra-ui/react";

import {Temporal} from "@js-temporal/polyfill";

import {useEffect, useMemo} from "react";

import {Link, useLocation, useNavigate} from "react-router";

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
import CalendarGrid from "~/components/frontpage/calendar_grid";
import ContentSection from "~/components/frontpage/content_section";
import PageHero from "~/components/frontpage/page_hero";

import ChevronRightIcon from "~/components/icons/chevron_right_icon";
import ChevronLeftIcon from "~/components/icons/chevron_left_icon";

import {validateParams, validateSearchParams} from "~/guards/validation";

import {SERVER_TIMEZONE} from "~/utils/constants";
import {useFormattedCalendarTimestamp} from "~/utils/locale";
import {NAVIGATOR_TIMEZONE} from "~/utils/navigator";
import {normalizeSpacing, truncateTextRight} from "~/utils/string";
import {buildAppURL} from "~/utils/url";
import {number} from "~/utils/valibot";

import {Route} from "./+types/_frontpage_.calendar.($year).($month)";

const EVENT_DESCRIPTION_CHARACTER_LIMIT = 192;

const LOADER_PARAMS_SCHEMA = v.object({
    month: v.optional(number),

    year: v.optional(number),
});

const LOADER_SEARCH_PARAMS_SCHEMA = v.object({
    timezone: v.optional(v.string()),
});

export async function loader(loaderArgs: Route.LoaderArgs) {
    let {month = null, year = null} = validateParams(
        LOADER_PARAMS_SCHEMA,
        loaderArgs,
    );

    const {timezone = SERVER_TIMEZONE} = validateSearchParams(
        LOADER_SEARCH_PARAMS_SCHEMA,
        loaderArgs,
    );

    if (month === null || year === null) {
        const {month: currentMonth, year: currentYear} =
            Temporal.Now.zonedDateTimeISO(timezone);

        month ??= currentMonth;
        year ??= currentYear;
    }

    const startDate = Temporal.PlainDate.from({year, month, day: 1});
    const endDate = startDate.add({months: 1});

    const zonedStartDate = startDate
        .toZonedDateTime({
            timeZone: timezone,
        })
        .toInstant();

    const zonedEndDate = endDate
        .toZonedDateTime({
            timeZone: timezone,
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
            timezone,
            year,
        },

        events: mappedEvents,
    };
}

export default function FrontpageNews(props: Route.ComponentProps) {
    const {loaderData} = props;

    const {calendar, events} = loaderData;
    const {month, timestamp, year, timezone} = calendar;

    const location = useLocation();
    const navigate = useNavigate();

    const currentURL = buildAppURL(location);
    const calendarZonedDateTime = Temporal.ZonedDateTime.from({
        year,
        month,

        day: 1,
        timeZone: timezone,
    });

    const {month: nextMonth, year: nextYear} = calendarZonedDateTime.add({
        months: 1,
    });

    const {month: previousMonth, year: previousYear} =
        calendarZonedDateTime.subtract({
            months: 1,
        });

    const nextMonthURL = new URL(currentURL);
    const previousMonthURL = new URL(currentURL);

    nextMonthURL.pathname = `/calendar/${nextYear}/${nextMonth}`;
    previousMonthURL.pathname = `/calendar/${previousYear}/${previousMonth}`;

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

    useEffect(() => {
        const {searchParams} = currentURL;

        if (timezone !== NAVIGATOR_TIMEZONE) {
            searchParams.set("timezone", NAVIGATOR_TIMEZONE);
            const {hash, pathname, search} = currentURL;

            navigate(
                {hash, pathname, search},

                {
                    replace: true,
                },
            );
        } else if (
            timezone === NAVIGATOR_TIMEZONE &&
            timezone === SERVER_TIMEZONE
        ) {
            if (searchParams.has("timezone")) {
                searchParams.delete("timezone");

                history.replaceState(history.state, "", currentURL);
            }
        }
    }, [currentURL, navigate, timezone]);

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

                            <Spacer />

                            <Group>
                                <IconButton
                                    colorPalette="cyan"
                                    size="lg"
                                    asChild
                                >
                                    <Link to={previousMonthURL.toString()}>
                                        <ChevronLeftIcon />
                                    </Link>
                                </IconButton>

                                <IconButton
                                    colorPalette="cyan"
                                    size="lg"
                                    asChild
                                >
                                    <Link to={nextMonthURL.toString()}>
                                        <ChevronRightIcon />
                                    </Link>
                                </IconButton>
                            </Group>
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
