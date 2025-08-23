import type {StackProps} from "@chakra-ui/react";
import {Flex, VStack} from "@chakra-ui/react";

import type {IDateLike} from "~/utils/datetime";

import FeedStack from "./feed_stack";
import FeedCard from "./feed_card";
import CalendarTextIcon from "../icons/calendar_text_icon";
import DatetimeRangeText from "../common/datetime_range_text";
import DatetimeText from "../common/datetime_text";
import PinIcon from "../icons/pin_icon";

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

export interface IAgendaFeedProps extends StackProps {
    readonly events: any;

    readonly timezone: string;
}

export default function AgendaFeed(props: IAgendaFeedProps) {
    const {events, timezone, ...rest} = props;

    return (
        <FeedStack.Root {...rest}>
            {events.map((event) => {
                const {
                    description,
                    endAtTimestamp,
                    eventID,
                    location,
                    template,
                    title,
                    startAtTimestamp,
                } = event;

                const url = template({event});

                return (
                    <FeedStack.Item key={eventID}>
                        <FeedCard.Root>
                            <FeedCard.Body>
                                <FeedCard.Title to={url.toString()}>
                                    {title}
                                </FeedCard.Title>

                                <FeedCard.Description>
                                    <VStack gap="1" alignItems="start">
                                        <Flex lineHeight="short">
                                            <CalendarTextIcon />
                                            &nbsp;
                                            {endAtTimestamp ? (
                                                <DatetimeRangeText
                                                    timezone={timezone}
                                                    startAtTimestamp={
                                                        startAtTimestamp
                                                    }
                                                    endAtTimestamp={
                                                        endAtTimestamp
                                                    }
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
                    </FeedStack.Item>
                );
            })}
        </FeedStack.Root>
    );
}
