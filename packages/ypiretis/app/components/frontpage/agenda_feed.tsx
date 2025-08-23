import type {StackProps} from "@chakra-ui/react";
import {Flex, VStack} from "@chakra-ui/react";

import {createContext, memo, useContext, useMemo} from "react";

import type {IDateLike} from "~/utils/datetime";
import {useTimezone} from "~/utils/datetime";

import FeedStack from "./feed_stack";
import FeedCard from "./feed_card";
import CalendarTextIcon from "../icons/calendar_text_icon";
import DatetimeRangeText from "../common/datetime_range_text";
import DatetimeText from "../common/datetime_text";
import PinIcon from "../icons/pin_icon";

const CONTEXT_AGENDA_FEED = createContext<IAgendaFeedContext | null>(null);

interface IAgendaFeedContext {
    readonly events: IAgendaFeedEvent[];

    readonly timezone: string;
}

interface IAgendaFeedItemProps
    extends Omit<StackProps, "asChild" | "children"> {
    readonly event: IAgendaFeedEvent;
}

export interface IEventTemplateContext {
    readonly event: IAgendaFeedEvent;
}

export type IAgendaFeedEventTemplate = (
    context: IEventTemplateContext,
) => string | URL;

export interface IAgendaFeedEvent {
    readonly dayTimestamp: IDateLike;

    readonly description: string;

    readonly endAtTimestamp?: IDateLike;

    readonly id: string;

    readonly location?: string;

    readonly startAtTimestamp: IDateLike;

    readonly title: string;

    readonly template: IAgendaFeedEventTemplate;
}

export interface IAgendaFeedProps
    extends Omit<StackProps, "asChild" | "children"> {
    readonly events: IAgendaFeedEvent[];

    readonly timezone: string;
}

function useAgendaFeedContext(): IAgendaFeedContext {
    const context = useContext(CONTEXT_AGENDA_FEED);

    if (context === null) {
        throw new ReferenceError(
            `bad dispatch to 'useAgendaFeedContext' (not a child of 'CONTEXT_AGENDA_FEED.Provider')`,
        );
    }

    return context;
}

function AgendaFeedItem(props: IAgendaFeedItemProps) {
    const {event} = props;

    const {
        description,
        endAtTimestamp,
        location,
        template,
        title,
        startAtTimestamp,
    } = event;

    const url = template({event});
    const {timezone} = useAgendaFeedContext();

    return (
        <FeedCard.Root>
            <FeedCard.Body>
                <FeedCard.Title to={url.toString()}>{title}</FeedCard.Title>

                <FeedCard.Description>
                    <VStack gap="1" alignItems="start">
                        <Flex lineHeight="short">
                            <CalendarTextIcon />
                            &nbsp;
                            {endAtTimestamp ? (
                                <DatetimeRangeText
                                    timezone={timezone}
                                    startAtTimestamp={startAtTimestamp}
                                    endAtTimestamp={endAtTimestamp}
                                    detail="long"
                                />
                            ) : (
                                <DatetimeText
                                    timezone={timezone}
                                    timestamp={startAtTimestamp}
                                    detail="long"
                                />
                            )}
                        </Flex>

                        <Flex lineHeight="short">
                            <PinIcon />
                            &nbsp;
                            {location ?? "TBD"}
                        </Flex>
                    </VStack>
                </FeedCard.Description>

                <FeedCard.Text>{description}</FeedCard.Text>
            </FeedCard.Body>
        </FeedCard.Root>
    );
}

const MemoizedCalenderGridItem = memo(AgendaFeedItem);

function AgendaFeedEvents() {
    const {events} = useAgendaFeedContext();

    return useMemo(() => {
        return events.map((event) => {
            const {id} = event;

            return (
                <FeedStack.Item key={id}>
                    <MemoizedCalenderGridItem event={event} />
                </FeedStack.Item>
            );
        });
    }, [events]);
}

export default function AgendaFeed(props: IAgendaFeedProps) {
    const {events, timezone = useTimezone(), ...rest} = props;

    const context = useMemo(() => {
        return {
            events,
            timezone,
        } satisfies IAgendaFeedContext;
    }, [events, timezone]);

    return (
        <CONTEXT_AGENDA_FEED.Provider value={context}>
            <FeedStack.Root {...rest}>
                <AgendaFeedEvents />
            </FeedStack.Root>
        </CONTEXT_AGENDA_FEED.Provider>
    );
}
