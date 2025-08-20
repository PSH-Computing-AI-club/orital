import {Group, IconButton, Spacer} from "@chakra-ui/react";

import {Temporal} from "@js-temporal/polyfill";

import {useEffect, useMemo} from "react";

import {
    Link,
    redirect,
    useLoaderData,
    useLocation,
    useNavigate,
} from "react-router";

import * as v from "valibot";

import {findAllPublished} from "~/.server/services/events_service";
import {SORT_MODES} from "~/.server/services/crud_service";
import {and, gte, lt} from "~/.server/services/crud_service.filters";
import {renderMarkdownForPlaintext} from "~/.server/services/markdown";

import {makeZonedCalendarGrid} from "~/.server/utils/locale";

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
            gte("publishedAt", minimumInstant),
            lt("publishedAt", maximumInstant),
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

    return {
        calendar: {
            month,
            timestamp,
            timezone,
            weeks: mappedWeeks,
            year,
        },

        events: mappedEvents,
    };
}

function useTimezoneSynchronization(): void {
    const loaderData = useLoaderData<typeof loader>();
    const {calendar} = loaderData;

    const {month, year, timezone} = calendar;

    const location = useLocation();
    const navigate = useNavigate();

    const currentURL = buildAppURL(location);

    useEffect(() => {
        const {searchParams} = currentURL;

        if (timezone !== NAVIGATOR_TIMEZONE) {
            const calendarZonedDateTime = Temporal.ZonedDateTime.from({
                year,
                month,

                day: 1,
                timeZone: timezone,
            });

            const {month: localizedMonth, year: localizedYear} =
                calendarZonedDateTime.withTimeZone(NAVIGATOR_TIMEZONE);

            currentURL.pathname = `/calendar/${localizedYear}/${localizedMonth}`;
            searchParams.set("timezone", NAVIGATOR_TIMEZONE);

            const {hash, pathname, search} = currentURL;

            navigate(
                {hash, pathname, search},

                {
                    replace: true,
                },
            );
        }
    }, [currentURL, month, navigate, timezone, year]);
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
                eventID,
                month,
                publishedAtTimestamp,
                slug,
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

                id: eventID,
                timestamp: publishedAtTimestamp,
            } satisfies ICalendarGridEvent;
        });
    }, [events]);

    return (
        <CalendarGrid
            events={calenderGridEvents}
            timezone={timezone}
            weeks={weeks}
        />
    );
}

function MonthNavigationGroup() {
    const loaderData = useLoaderData<typeof loader>();
    const {calendar} = loaderData;

    const {month, year, timezone} = calendar;

    const location = useLocation();
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

    useTimezoneSynchronization();

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

                    <EventCalendar />
                </ContentSection.Container>
            </ContentSection.Root>
        </>
    );
}
