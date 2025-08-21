import {Group, IconButton, Spacer} from "@chakra-ui/react";

import {Temporal} from "@js-temporal/polyfill";

import {useMemo} from "react";

import {Link, redirect, useLoaderData, useLocation} from "react-router";

import * as v from "valibot";

import {findAllPublished} from "~/.server/services/events_service";
import {SORT_MODES} from "~/.server/services/crud_service";
import {and, gte, lt} from "~/.server/services/crud_service.filters";
import {renderMarkdownForPlaintext} from "~/.server/services/markdown";

import {makeZonedCalendarGrid} from "~/.server/utils/locale";

import DatetimeRangeText from "~/components/common/datetime_range_text";
import EmptyState from "~/components/common/empty_state";
import Title from "~/components/common/title";

import type {
    ICalendarGridDay,
    ICalendarGridEvent,
    ICalendarGridMonth,
    ICalendarGridWeek,
    ICalenderGridEventTemplate,
} from "~/components/frontpage/calendar_grid";
import CalendarGrid from "~/components/frontpage/calendar_grid";
import ContentSection from "~/components/frontpage/content_section";
import FeedCard from "~/components/frontpage/feed_card";
import FeedStack from "~/components/frontpage/feed_stack";
import PageHero from "~/components/frontpage/page_hero";

import CalendarRemoveIcon from "~/components/icons/calendar_remove_icon";
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
    const {timezone = null} = validateSearchParams(
        LOADER_SEARCH_PARAMS_SCHEMA,
        loaderArgs,
    );

    let {month = null, year = null} = validateParams(
        LOADER_PARAMS_SCHEMA,
        loaderArgs,
    );

    if (month === null || year === null || timezone === null) {
        const {month: currentMonth, year: currentYear} =
            Temporal.Now.zonedDateTimeISO(timezone ?? SERVER_TIMEZONE);

        return redirect(
            `/calendar/${currentYear}/${currentMonth}?timezone=${SERVER_TIMEZONE}`,
        );
    }

    const weeks = makeZonedCalendarGrid({
        month,
        year,
        timezone,
    });

    const firstWeek = weeks[0];
    const lastWeek = weeks.at(-1)!;

    const firstSunday = firstWeek[0];
    const lastSaturday = lastWeek.at(-1)!;

    const minimumInstant = firstSunday.toInstant();
    const maximumInstant = lastSaturday
        .add({
            days: 1,
        })
        .toInstant();

    const firstDay = firstWeek.find((day) => {
        const {day: dayOfMonth} = day;

        return dayOfMonth === 1;
    })!;

    const events = await findAllPublished({
        sort: {
            by: "publishedAt",
            mode: SORT_MODES.descending,
        },

        where: and(
            gte("startAt", minimumInstant),
            lt("startAt", maximumInstant),
        ),
    });

    const mappedEvents = await Promise.all(
        events.map(async (event) => {
            const {content, eventID, slug, startAt, title} = event;

            const endAt =
                event.endAt instanceof Temporal.Instant ? event.endAt : startAt;

            const zonedPublishedAt =
                startAt!.toZonedDateTimeISO(SERVER_TIMEZONE);

            const plaintextContent = await renderMarkdownForPlaintext(content);
            const description = normalizeSpacing(
                truncateTextRight(
                    plaintextContent,
                    EVENT_DESCRIPTION_CHARACTER_LIMIT,
                ),
            );

            const {epochMilliseconds: endAtTimestamp} = endAt!;
            const {epochMilliseconds: startAtTimestamp} = startAt!;

            const {year, month, day} = zonedPublishedAt;

            return {
                day,
                description,
                endAtTimestamp,
                eventID,
                month,
                startAtTimestamp,
                slug,
                title,
                year,
            };
        }),
    );

    const mappedWeeks = weeks.map((week) => {
        return week.map((day) => {
            const {dayOfWeek, epochMilliseconds, month: monthOfDay} = day;

            const isInMonth = month === monthOfDay;
            const isWeekend = dayOfWeek > 5;

            return {
                isInMonth,
                isWeekend,
                timestamp: epochMilliseconds,
            } satisfies ICalendarGridDay;
        }) as ICalendarGridWeek;
    }) as ICalendarGridMonth;

    const {epochMilliseconds: timestamp} = firstDay;

    const currentMonth = Temporal.PlainYearMonth.from({
        year,
        month,
    });

    const {month: nextMonth, year: nextYear} = currentMonth.add({
        months: 1,
    });

    const {month: previousMonth, year: previousYear} = currentMonth.subtract({
        months: 1,
    });

    return {
        calendar: {
            timestamp,
            timezone,
            weeks: mappedWeeks,
        },

        navigation: {
            next: {
                month: nextMonth,
                year: nextYear,
            },

            previous: {
                month: previousMonth,
                year: previousYear,
            },
        },

        events: mappedEvents,
    };
}

export async function clientLoader(clientLoaderArgs: Route.ClientLoaderArgs) {
    const {request, serverLoader} = clientLoaderArgs;
    const loaderData = await serverLoader();

    const {calendar} = loaderData;
    const {timezone} = calendar;

    if (timezone !== NAVIGATOR_TIMEZONE) {
        const url = new URL(request.url);

        url.searchParams.set("timezone", NAVIGATOR_TIMEZONE);
        return redirect(url.toString());
    }

    return loaderData;
}

clientLoader.hydrate = true as const;

function EventAgendaEmptyState() {
    return (
        <EmptyState.Root display={{base: "flex", xl: "none"}}>
            <EmptyState.Container>
                <EmptyState.Icon>
                    <CalendarRemoveIcon />
                </EmptyState.Icon>

                <EmptyState.Body>
                    <EmptyState.Title>No events scheduled.</EmptyState.Title>

                    <EmptyState.Description>
                        Events have not been scheduled for this month.
                    </EmptyState.Description>
                </EmptyState.Body>
            </EmptyState.Container>
        </EmptyState.Root>
    );
}

function EventAgendaFeed() {
    const loaderData = useLoaderData<typeof loader>();
    const {calendar, events} = loaderData;

    const {timezone} = calendar;

    return (
        <FeedStack.Root display={{base: "flex", xl: "none"}}>
            {events.map((event) => {
                const {
                    day,
                    description,
                    endAtTimestamp,
                    eventID,
                    month,
                    title,
                    slug,
                    startAtTimestamp,
                    year,
                } = event;

                return (
                    <FeedStack.Item key={eventID}>
                        <FeedCard.Root>
                            <FeedCard.Body>
                                <FeedCard.Title
                                    to={`/calendar/events/${event}/${year}/${month}/${day}/${slug}`}
                                >
                                    {title}
                                </FeedCard.Title>

                                <FeedCard.Description>
                                    <DatetimeRangeText
                                        timezone={timezone}
                                        startAtTimestamp={startAtTimestamp}
                                        endAtTimestamp={endAtTimestamp}
                                        detail="long"
                                    />
                                </FeedCard.Description>

                                <FeedCard.Text>{description}</FeedCard.Text>
                            </FeedCard.Body>
                        </FeedCard.Root>
                    </FeedStack.Item>
                );
            })}
        </FeedStack.Root>
    );
}

function EventAgenda() {
    const loaderData = useLoaderData<typeof loader>();
    const {events} = loaderData;

    return events.length > 0 ? <EventAgendaFeed /> : <EventAgendaEmptyState />;
}

function EventCalendar() {
    const loaderData = useLoaderData<typeof loader>();
    const {calendar, events} = loaderData;

    const {timezone, weeks} = calendar;

    const calenderGridEvents = useMemo(() => {
        return events.map((event) => {
            const {
                day,
                description,
                endAtTimestamp,
                eventID,
                month,
                slug,
                startAtTimestamp,
                title,
                year,
            } = event;

            const template = ((_context) => {
                return `/calendar/events/${eventID}/${year}/${month}/${day}/${slug}`;
            }) satisfies ICalenderGridEventTemplate;

            return {
                description,
                template,
                title,
                endAtTimestamp,
                startAtTimestamp,

                id: eventID,
            } satisfies ICalendarGridEvent;
        });
    }, [events]);

    return (
        <CalendarGrid
            events={calenderGridEvents}
            timezone={timezone}
            weeks={weeks}
            display={{base: "grid", xlDown: "none"}}
        />
    );
}

function MonthNavigationGroup() {
    const loaderData = useLoaderData<typeof loader>();
    const {navigation} = loaderData;

    const {next, previous} = navigation;

    const {month: nextMonth, year: nextYear} = next;
    const {month: previousMonth, year: previousYear} = previous;

    const location = useLocation();
    const currentURL = buildAppURL(location);

    const nextMonthURL = new URL(currentURL);
    const previousMonthURL = new URL(currentURL);

    nextMonthURL.pathname = `/calendar/${nextYear}/${nextMonth}`;
    previousMonthURL.pathname = `/calendar/${previousYear}/${previousMonth}`;

    return (
        <Group>
            <IconButton
                colorPalette="cyan"
                size={{base: "lg", lgDown: "md"}}
                asChild
            >
                <Link to={previousMonthURL.toString()}>
                    <ChevronLeftIcon />
                </Link>
            </IconButton>

            <IconButton
                colorPalette="cyan"
                size={{base: "lg", lgDown: "md"}}
                asChild
            >
                <Link to={nextMonthURL.toString()}>
                    <ChevronRightIcon />
                </Link>
            </IconButton>
        </Group>
    );
}

export default function FrontpageCalendar(props: Route.ComponentProps) {
    const {loaderData} = props;

    const {calendar} = loaderData;
    const {timestamp, timezone} = calendar;

    const {isoTimestamp, textualTimestamp} = useFormattedCalendarTimestamp(
        timestamp,
        {timezone},
    );

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

                            <MonthNavigationGroup />
                        </ContentSection.Title>
                    </ContentSection.Header>

                    <EventAgenda />
                    <EventCalendar />
                </ContentSection.Container>
            </ContentSection.Root>
        </>
    );
}
