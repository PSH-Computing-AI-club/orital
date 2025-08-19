import type {SimpleGridProps} from "@chakra-ui/react";
import {Box, SimpleGrid} from "@chakra-ui/react";

import {useMemo} from "react";

import {useGeneratedCalendarGrid, zeroDay} from "~/utils/datetime";

export type IEventTemplate = (context: IEventTemplateContext) => string | URL;

export interface IEvent {
    readonly id: string;

    readonly description: string;

    readonly timestamp: number | Date;

    readonly title: string;
}

export interface IEventTemplateContext {
    readonly event: IEvent;
}

export interface ICalendarGridProps extends SimpleGridProps {
    readonly events: IEvent[];

    readonly timestamp: number | Date;

    readonly template: IEventTemplate;
}

function makeEventDayLookup(events: IEvent[]): Map<number, IEvent[]> {
    const dayLookup = new Map<number, IEvent[]>();

    for (const event of events) {
        const {timestamp} = event;
        const date = zeroDay(timestamp);

        const epochMilliseconds = date.getTime();
        const lookup = dayLookup.get(epochMilliseconds) ?? [];

        lookup.push(event);
        dayLookup.set(epochMilliseconds, lookup);
    }

    return dayLookup;
}

export function CalendarGrid(props: ICalendarGridProps) {
    const {events, template, timestamp} = props;

    const calendarGrid = useGeneratedCalendarGrid(timestamp);
    const dayLookup = useMemo(() => {
        return makeEventDayLookup(events);
    }, [events]);

    return (
        <SimpleGrid columns={7}>
            {calendarGrid.flatMap((calendarWeek, _index) => {
                return calendarWeek.map((calendarDay, _index) => {
                    const {date} = calendarDay;

                    return <Box>{date.getDay()}</Box>;
                });
            })}
        </SimpleGrid>
    );
}
