import type {
    ListItemProps,
    ListRootProps,
    HoverCardRootProps,
    SimpleGridProps,
    SpanProps,
    StackProps,
} from "@chakra-ui/react";
import {
    Box,
    HoverCard,
    List,
    Portal,
    SimpleGrid,
    Span,
    Strong,
    Text,
    VStack,
} from "@chakra-ui/react";

import {createContext, memo, useContext, useMemo} from "react";

import CalendarDayText from "~/components/common/calendar_day_text";
import DatetimeText from "~/components/common/datetime_text";
import DatetimeRangeText from "~/components/common/datetime_range_text";
import ScheduleTimeText from "~/components/common/schedule_time_text";
import Links from "~/components/common/links";

import CalendarTextIcon from "~/components/icons/calendar_text_icon";
import PinIcon from "~/components/icons/pin_icon";

import type {IDateLike} from "~/utils/datetime";
import {toDate, useTimezone} from "~/utils/datetime";
import {formatCalendarWeekdays} from "~/utils/locale";

const CONTEXT_CALENDAR_GRID = createContext<ICalendarGridContext | null>(null);

type ICalendarGridDayLookup = Map<number, ICalendarGridEvent[]>;

export type ICalendarGridMonth = [
    ICalendarGridWeek,
    ICalendarGridWeek,
    ICalendarGridWeek,
    ICalendarGridWeek,
    ICalendarGridWeek,
    ICalendarGridWeek,
];

export type ICalendarGridWeek = [
    ICalendarGridDay,
    ICalendarGridDay,
    ICalendarGridDay,
    ICalendarGridDay,
    ICalendarGridDay,
    ICalendarGridDay,
    ICalendarGridDay,
];

export type ICalenderGridEventTemplate = (
    context: IEventTemplateContext,
) => string | URL;

interface ICalendarGridContext {
    readonly dayLookup: ICalendarGridDayLookup;

    readonly timezone: string;

    readonly weeks: IInternalCalendarGridDay[][];
}

interface IInternalCalendarGridDay {
    readonly date: Date;

    readonly isInMonth: boolean;

    readonly isWeekend: boolean;
}

interface ICalendarGridItemScheduleHoverCardProps
    extends Omit<HoverCardRootProps, "asChild"> {
    readonly event: ICalendarGridEvent;
}

interface ICalendarGridItemScheduleListingProps
    extends Omit<ListItemProps, "asChild" | "children"> {
    readonly event: ICalendarGridEvent;
}

interface ICalenderGridItemScheduleProps
    extends Omit<ListRootProps, "asChild" | "children"> {
    readonly events: ICalendarGridEvent[];
}

interface ICalenderGridItemDayProps
    extends Omit<SpanProps, "asChild" | "children"> {
    readonly day: IInternalCalendarGridDay;
}

interface ICalenderGridItemProps
    extends Omit<StackProps, "asChild" | "children"> {
    readonly day: IInternalCalendarGridDay;
}

export interface IEventTemplateContext {
    readonly event: ICalendarGridEvent;
}

export interface ICalendarGridDay {
    readonly isInMonth: boolean;

    readonly isWeekend: boolean;

    readonly timestamp: IDateLike;
}

export interface ICalendarGridEvent {
    readonly dayTimestamp: IDateLike;

    readonly description: string;

    readonly endAtTimestamp?: IDateLike;

    readonly id: string;

    readonly location?: string;

    readonly startAtTimestamp: IDateLike;

    readonly title: string;

    readonly template: ICalenderGridEventTemplate;
}

export interface ICalendarGridProps
    extends Omit<SimpleGridProps, "asChild" | "children"> {
    readonly events: ICalendarGridEvent[];

    readonly timezone?: string;

    readonly weeks: ICalendarGridMonth;
}

function makeEventDayLookup(
    events: ICalendarGridEvent[],
): Map<number, ICalendarGridEvent[]> {
    const dayLookup = new Map<number, ICalendarGridEvent[]>();

    for (const event of events) {
        const {dayTimestamp} = event;

        const date = toDate(dayTimestamp);
        const epochMilliseconds = date.getTime();

        const events = dayLookup.get(epochMilliseconds) ?? [];
        events.push(event);

        dayLookup.set(epochMilliseconds, events);
    }

    return dayLookup;
}

function useCalendarGridContext(): ICalendarGridContext {
    const context = useContext(CONTEXT_CALENDAR_GRID);

    if (context === null) {
        throw new ReferenceError(
            `bad dispatch to 'useCalendarGridContext' (not a child of 'CONTEXT_CALENDAR_GRID.Provider')`,
        );
    }

    return context;
}

function CalendarGridItemScheduleHoverCard(
    props: ICalendarGridItemScheduleHoverCardProps,
) {
    const {children, event, ...rest} = props;
    const {description, endAtTimestamp, location, title, startAtTimestamp} =
        event;

    const {timezone} = useCalendarGridContext();

    return (
        <HoverCard.Root {...rest}>
            <HoverCard.Trigger asChild>{children}</HoverCard.Trigger>

            <Portal>
                <HoverCard.Positioner>
                    <HoverCard.Content inlineSize="2xs">
                        <Strong>{title}</Strong>

                        <VStack
                            gap="0"
                            flexWrap="1"
                            alignItems="start"
                            color="fg.muted"
                            fontSize="2xs"
                        >
                            <Span
                                textIndent="-1.6em"
                                paddingInlineStart="1.6em"
                            >
                                <CalendarTextIcon />
                                &nbsp;
                                {endAtTimestamp ? (
                                    <DatetimeRangeText
                                        timezone={timezone}
                                        startAtTimestamp={startAtTimestamp}
                                        endAtTimestamp={endAtTimestamp}
                                    />
                                ) : (
                                    <DatetimeText
                                        timezone={timezone}
                                        timestamp={startAtTimestamp}
                                    />
                                )}
                            </Span>

                            <Span
                                textIndent="-1.6em"
                                paddingInlineStart="1.6em"
                            >
                                <PinIcon />
                                &nbsp;
                                {location ?? "TBD"}
                            </Span>
                        </VStack>

                        <Text marginBlockStart="2">{description}</Text>
                    </HoverCard.Content>
                </HoverCard.Positioner>
            </Portal>
        </HoverCard.Root>
    );
}

function CalendarGridItemScheduleListing(
    props: ICalendarGridItemScheduleListingProps,
) {
    const {event, ...rest} = props;
    const {title, template, startAtTimestamp} = event;

    const {timezone} = useCalendarGridContext();
    const url = template({event});

    return (
        <List.Item {...rest}>
            <CalendarGridItemScheduleHoverCard event={event}>
                <Links.InternalLink
                    variant="plain"
                    to={url.toString()}
                    overflow="hidden"
                >
                    <ScheduleTimeText
                        timezone={timezone}
                        timestamp={startAtTimestamp}
                        whiteSpace="nowrap"
                        fontSize="2xs"
                        fontWeight="bold"
                    />

                    <Span
                        whiteSpace="nowrap"
                        overflow="hidden"
                        textOverflow="ellipsis"
                    >
                        {title}
                    </Span>
                </Links.InternalLink>
            </CalendarGridItemScheduleHoverCard>
        </List.Item>
    );
}

function CalendarGridItemSchedule(props: ICalenderGridItemScheduleProps) {
    const {events, ...rest} = props;

    const scheduleListings = useMemo(() => {
        return events.map((event) => {
            const {id} = event;

            return <CalendarGridItemScheduleListing key={id} event={event} />;
        });
    }, [events]);

    return (
        <List.Root
            variant="plain"
            contain="size"
            flexGrow="1"
            justifyContent="end"
            inlineSize="full"
            fontWeight="normal"
            fontSize="xs"
            overflow="hidden"
            {...rest}
        >
            {scheduleListings}
        </List.Root>
    );
}

function CalenderGridItemDay(props: ICalenderGridItemDayProps) {
    const {day, ...rest} = props;
    const {date} = day;

    const {timezone} = useCalendarGridContext();

    return (
        <Span
            padding="2"
            marginInlineStart="auto"
            marginInlineEnd="-2"
            marginBlockStart="-2"
            bg="bg.inverted"
            color="fg.inverted"
            fontWeight="bold"
            asChild
            {...rest}
        >
            <CalendarDayText timezone={timezone} timestamp={date} />
        </Span>
    );
}

function CalendarGridItem(props: ICalenderGridItemProps) {
    const {day, ...rest} = props;
    const {dayLookup} = useCalendarGridContext();

    const {date, isInMonth, isWeekend} = day;

    const epochMilliseconds = date.getTime();
    const events = dayLookup.get(epochMilliseconds) ?? null;

    return (
        <VStack
            fontSize="sm"
            padding="2"
            height="3xs"
            alignItems="start"
            bg={isWeekend ? "bg.emphasized" : "bg.panel"}
            color={isWeekend ? "fg.emphasized" : "fg.panel"}
            borderColor={isWeekend ? "border.emphasized" : "border"}
            borderWidth="thin"
            borderStyle="solid"
            opacity={isInMonth ? "1" : "0.5"}
            {...rest}
        >
            <CalenderGridItemDay day={day} />

            {events ? <CalendarGridItemSchedule events={events} /> : <></>}
        </VStack>
    );
}

const MemoizedCalenderGridItem = memo(CalendarGridItem);

function CalendarGridWeekdayHeaders() {
    const {weeks} = useCalendarGridContext();

    const [firstWeek] = weeks;

    const weekdays = useMemo(() => {
        return formatCalendarWeekdays(
            firstWeek.map((day) => {
                const {date} = day;

                return date.getTime();
            }) as [number, number, number, number, number, number, number],
        );
    }, [firstWeek]);

    return useMemo(() => {
        return weekdays.map((weekday) => {
            return (
                <Box
                    key={weekday}
                    padding="2"
                    bg="bg.inverted"
                    color="fg.inverted"
                    textAlign="center"
                >
                    {weekday}
                </Box>
            );
        });
    }, [weekdays]);
}

function CalendarGridWeeks() {
    const {weeks} = useCalendarGridContext();

    return useMemo(() => {
        return weeks.flatMap((week) => {
            return week.map((day) => {
                const {date} = day;

                return (
                    <MemoizedCalenderGridItem key={date.getTime()} day={day} />
                );
            });
        });
    }, [weeks]);
}

export default function CalendarGrid(props: ICalendarGridProps) {
    const {events, timezone = useTimezone(), weeks, ...rest} = props;

    const dayLookup = useMemo(() => {
        return makeEventDayLookup(events);
    }, [events]);

    const mappedWeeks = useMemo(() => {
        return weeks.map((week) => {
            return week.map((day) => {
                const {isInMonth, isWeekend, timestamp} = day;

                return {
                    isInMonth,
                    isWeekend,

                    date: toDate(timestamp),
                };
            });
        });
    }, [weeks]);

    const context = useMemo(() => {
        return {
            dayLookup,
            timezone,
            weeks: mappedWeeks,
        } satisfies ICalendarGridContext;
    }, [dayLookup, mappedWeeks, timezone]);

    return (
        <CONTEXT_CALENDAR_GRID.Provider value={context}>
            <SimpleGrid columns={7} gap="2" {...rest}>
                <CalendarGridWeekdayHeaders />
                <CalendarGridWeeks />
            </SimpleGrid>
        </CONTEXT_CALENDAR_GRID.Provider>
    );
}
