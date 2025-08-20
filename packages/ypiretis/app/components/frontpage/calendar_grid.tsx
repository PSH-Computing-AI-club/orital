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
import Links from "~/components/common/links";

import type {IDateLike} from "~/utils/datetime";
import {toDate, useTimezone, zeroDay} from "~/utils/datetime";
import {formatCalendarWeekdays, useFormattedScheduleTime} from "~/utils/locale";

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
    readonly timestamp: IDateLike;
}

export interface ICalendarGridEvent {
    readonly id: string;

    readonly description: string;

    readonly timestamp: IDateLike;

    readonly title: string;

    readonly template: ICalenderGridEventTemplate;
}

export interface ICalendarGridProps extends SimpleGridProps {
    readonly events: ICalendarGridEvent[];

    readonly timezone?: string;

    readonly weeks: ICalendarGridMonth;
}

function makeEventDayLookup(
    events: ICalendarGridEvent[],
): Map<number, ICalendarGridEvent[]> {
    const dayLookup = new Map<number, ICalendarGridEvent[]>();

    for (const event of events) {
        const {timestamp} = event;
        const date = zeroDay(timestamp);

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
    const {description, title, timestamp} = event;

    return (
        <HoverCard.Root {...rest}>
            <HoverCard.Trigger>{children}</HoverCard.Trigger>

            <Portal>
                <HoverCard.Positioner>
                    <HoverCard.Content>
                        <Strong>{title}</Strong>
                        <Span color="fg.muted" fontSize="2xs">
                            {timestamp}
                        </Span>

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
    const {title, template, timestamp} = event;

    const url = template({event});
    const textualTimestamp = useFormattedScheduleTime(timestamp);

    return (
        <List.Item {...rest}>
            <CalendarGridItemScheduleHoverCard event={event}>
                <Links.InternalLink
                    variant="plain"
                    to={url.toString()}
                    overflow="hidden"
                >
                    <Strong whiteSpace="nowrap" fontSize="2xs">
                        {textualTimestamp}
                    </Strong>

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
            {events.map((event) => {
                const {id} = event;

                return (
                    <CalendarGridItemScheduleListing key={id} event={event} />
                );
            })}
        </List.Root>
    );
}

function CalenderGridItemDay(props: ICalenderGridItemDayProps) {
    const {day, ...rest} = props;
    const {date} = day;

    return (
        <Span
            padding="2"
            marginInlineStart="auto"
            marginInlineEnd="-2"
            marginBlockStart="-2"
            bg="bg.inverted"
            color="fg.inverted"
            asChild
            {...rest}
        >
            <CalendarDayText timestamp={date} />
        </Span>
    );
}

function CalendarGridItem(props: ICalenderGridItemProps) {
    const {day, ...rest} = props;
    const {dayLookup} = useCalendarGridContext();

    const {date} = day;
    const timestamp = date.getTime();

    const isInMonth = false;
    const isWeekend = false;

    const events = isInMonth ? (dayLookup.get(timestamp) ?? null) : null;

    return (
        <VStack
            fontSize="sm"
            fontWeight="bold"
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
}

function CalendarGridWeeks() {
    const {weeks} = useCalendarGridContext();

    return (
        <>
            {weeks.flatMap((week) => {
                return week.map((day) => {
                    const {date} = day;

                    return (
                        <MemoizedCalenderGridItem
                            key={date.getTime()}
                            day={day}
                        />
                    );
                });
            })}
        </>
    );
}

export default function CalendarGrid(props: ICalendarGridProps) {
    const {events, timezone = useTimezone(), weeks} = props;

    const dayLookup = useMemo(() => {
        return makeEventDayLookup(events);
    }, [events]);

    const context = useMemo(() => {
        const mappedWeeks = weeks.map((week) => {
            return week.map((day) => {
                const {timestamp} = day;

                return {
                    date: toDate(timestamp),
                };
            });
        });

        return {
            dayLookup,
            timezone,
            weeks: mappedWeeks,
        } satisfies ICalendarGridContext;
    }, [dayLookup, timezone, weeks]);

    return (
        <CONTEXT_CALENDAR_GRID.Provider value={context}>
            <SimpleGrid columns={7} gap="2">
                <CalendarGridWeekdayHeaders />
                <CalendarGridWeeks />
            </SimpleGrid>
        </CONTEXT_CALENDAR_GRID.Provider>
    );
}
