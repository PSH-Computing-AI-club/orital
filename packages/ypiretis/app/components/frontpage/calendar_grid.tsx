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

import {memo, useMemo} from "react";

import Links from "~/components/common/links";

import {useTimezone, zeroDay} from "~/utils/datetime";
import type {IFormattedCalendarDay} from "~/utils/locale";
import {
    useFormattedCalendarGrid,
    useFormattedScheduleTime,
    useFormattedCalendarWeekdays,
} from "~/utils/locale";

export type ICalenderGridEventTemplate = (
    context: IEventTemplateContext,
) => string | URL;

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
    readonly calendarDay: IFormattedCalendarDay;
}

interface ICalenderGridItemProps
    extends Omit<StackProps, "asChild" | "children"> {
    readonly calendarDay: IFormattedCalendarDay;

    readonly dayLookup: Map<number, ICalendarGridEvent[]>;

    readonly month: number;
}

export interface ICalendarGridEvent {
    readonly id: string;

    readonly description: string;

    readonly timestamp: number | Date;

    readonly title: string;

    readonly template: ICalenderGridEventTemplate;
}

export interface IEventTemplateContext {
    readonly event: ICalendarGridEvent;
}

export interface ICalendarGridProps extends SimpleGridProps {
    readonly events: ICalendarGridEvent[];

    readonly month: number;

    readonly timezone?: string;

    readonly year: number;
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
    const {calendarDay, ...rest} = props;
    const {isoTimestamp, textualTimestamp} = calendarDay;

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
            <time dateTime={isoTimestamp}>{textualTimestamp}</time>
        </Span>
    );
}

function CalendarGridItem(props: ICalenderGridItemProps) {
    const {calendarDay, dayLookup, month, ...rest} = props;
    const {zonedDateTime} = calendarDay;

    const {dayOfWeek, month: dayMonth} = zonedDateTime;
    const {epochMilliseconds} = zonedDateTime.withTimeZone("UTC").startOfDay();

    const isInMonth = dayMonth === month;
    const isWeekend = dayOfWeek > 5;

    const events = isInMonth
        ? (dayLookup.get(epochMilliseconds) ?? null)
        : null;

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
            <CalenderGridItemDay calendarDay={calendarDay} />

            {events ? <CalendarGridItemSchedule events={events} /> : <></>}
        </VStack>
    );
}

const MemoizedCalenderGridItem = memo(CalendarGridItem);

function CalendarGridWeekdayHeaders() {
    const weekdays = useFormattedCalendarWeekdays();

    return weekdays.map((weekday, index) => {
        return (
            <Box
                key={index}
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

export default function CalendarGrid(props: ICalendarGridProps) {
    const {events, month, year, timezone = useTimezone()} = props;

    const calendarGrid = useFormattedCalendarGrid({
        month,
        year,
        timezone,
    });

    const dayLookup = useMemo(() => {
        return makeEventDayLookup(events);
    }, [events]);

    return (
        <SimpleGrid columns={7} gap="2">
            <CalendarGridWeekdayHeaders />

            {calendarGrid.flatMap((calendarWeek, _index) => {
                return calendarWeek.map((calendarDay, _index) => {
                    const {isoTimestamp} = calendarDay;

                    return (
                        <MemoizedCalenderGridItem
                            key={isoTimestamp}
                            calendarDay={calendarDay}
                            dayLookup={dayLookup}
                            month={month}
                        />
                    );
                });
            })}
        </SimpleGrid>
    );
}
