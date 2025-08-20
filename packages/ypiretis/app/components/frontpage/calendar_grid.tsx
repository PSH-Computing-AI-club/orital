import type {SimpleGridProps} from "@chakra-ui/react";
import {
    Box,
    List,
    SimpleGrid,
    Strong,
    Span,
    VStack,
    Group,
} from "@chakra-ui/react";

import {memo, useMemo} from "react";

import {useTimezone, zeroDay} from "~/utils/datetime";
import type {IFormattedCalendarDay} from "~/utils/locale";
import {
    formatScheduleTime,
    useFormattedCalendarGrid,
    useFormattedCalendarWeekdays,
} from "~/utils/locale";

export type ICalenderGridEventTemplate = (
    context: IEventTemplateContext,
) => string | URL;

interface ICalenderGridItemEventListProps {
    readonly events: ICalendarGridEvent[];
}

interface ICalenderGridItemDayProps {
    readonly calendarDay: IFormattedCalendarDay;
}

interface ICalenderGridItemProps {
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

function CalendarGridItemEventList(props: ICalenderGridItemEventListProps) {
    const {events} = props;

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
        >
            {events.map((event) => {
                const {id, title, timestamp} = event;

                const textualTimestamp = formatScheduleTime(timestamp);

                return (
                    <List.Item key={id}>
                        <Group gap="1" overflow="hidden">
                            <Strong whiteSpace="nowrap" fontSize="2xs">
                                {textualTimestamp}
                            </Strong>{" "}
                            <Span
                                display="inline-block"
                                whiteSpace="nowrap"
                                overflow="hidden"
                                textOverflow="ellipsis"
                            >
                                {title}
                            </Span>
                        </Group>
                    </List.Item>
                );
            })}
        </List.Root>
    );
}

function CalenderGridItemDay(props: ICalenderGridItemDayProps) {
    const {calendarDay} = props;
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
        >
            <time dateTime={isoTimestamp}>{textualTimestamp}</time>
        </Span>
    );
}

function CalendarGridItem(props: ICalenderGridItemProps) {
    const {calendarDay, dayLookup, month} = props;
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
        >
            <CalenderGridItemDay calendarDay={calendarDay} />

            {events ? <CalendarGridItemEventList events={events} /> : <></>}
        </VStack>
    );
}

const MemoizedCalenderGridItem = memo(CalendarGridItem);

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
