import type {SimpleGridProps} from "@chakra-ui/react";
import {SimpleGrid, Span, VStack} from "@chakra-ui/react";

import {useMemo} from "react";

import {useTimezone, zeroDay} from "~/utils/datetime";
import {useFormattedCalendarGrid} from "~/utils/locale";

export type ICalenderGridEventTemplate = (
    context: IEventTemplateContext,
) => string | URL;

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

    readonly year: number;

    readonly timezone?: string;
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

export function CalendarGrid(props: ICalendarGridProps) {
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
            {calendarGrid.flatMap((calendarWeek, _index) => {
                return calendarWeek.map((calendarDay, _index) => {
                    const {isoTimestamp, textualTimestamp, zonedDateTime} =
                        calendarDay;

                    const {dayOfWeek, month: dayMonth} = zonedDateTime;
                    const {epochMilliseconds} = zonedDateTime
                        .withTimeZone("UTC")
                        .startOfDay();

                    const isInMonth = dayMonth === month;
                    const isWeekend = dayOfWeek > 5;

                    const events = isInMonth
                        ? (dayLookup.get(epochMilliseconds) ?? null)
                        : null;

                    let backgroundColor: string;
                    let textColor: string;

                    if (!isInMonth) {
                        backgroundColor = "bg.subtle";
                        textColor = "fg.subtle";
                    } else if (isWeekend) {
                        backgroundColor = "bg.emphasized";
                        textColor = "fg.emphasized";
                    } else {
                        backgroundColor = "bg.panel";
                        textColor = "fg.panel";
                    }

                    return (
                        <VStack
                            key={isoTimestamp}
                            fontSize="sm"
                            fontWeight="bold"
                            padding="2"
                            height="2xs"
                            alignItems="start"
                            bg={backgroundColor}
                            color={textColor}
                            borderColor="border"
                            borderWidth="thin"
                            borderStyle="solid"
                        >
                            <Span marginLeft="auto" asChild>
                                <time dateTime={isoTimestamp}>
                                    {textualTimestamp}
                                </time>
                            </Span>
                        </VStack>
                    );
                });
            })}
        </SimpleGrid>
    );
}
