import {Card, LinkOverlay, Span, Text} from "@chakra-ui/react";

import type {PropsWithChildren} from "react";

import type {To} from "react-router";

import Links from "~/components/common/links";

export interface IFeedCardTextProps extends PropsWithChildren {
    readonly lineClamp?: number;
}

export interface IFeedCardDescriptionProps extends PropsWithChildren {}

export interface IFeedCardTitleProps extends PropsWithChildren {
    readonly to?: To;
}

export interface IFeedCardBodyProps extends PropsWithChildren {}

export interface IFeedCardRootProps extends PropsWithChildren {}

function FeedCardText(props: IFeedCardTextProps) {
    const {children, lineClamp = 5} = props;

    return (
        <Text
            marginBlockStart="4"
            overflow="hidden"
            style={{
                display: "-webkit-box",
                WebkitBoxOrient: "vertical",
                WebkitLineClamp: lineClamp,
            }}
        >
            {children}
        </Text>
    );
}

function FeedCardDescription(props: IFeedCardDescriptionProps) {
    const {children} = props;

    return <Card.Description>{children}</Card.Description>;
}

function FeedCardTitle(props: IFeedCardTitleProps) {
    const {children, to} = props;

    return (
        <Card.Title>
            <Span
                display="block"
                whiteSpace="nowrap"
                overflow="hidden"
                textOverflow="ellipsis"
                asChild
            >
                {to ? (
                    <LinkOverlay asChild>
                        <Links.InternalLink to={to}>
                            {children}
                        </Links.InternalLink>
                    </LinkOverlay>
                ) : (
                    <Span>{children}</Span>
                )}
            </Span>
        </Card.Title>
    );
}

function FeedCardBody(props: IFeedCardBodyProps) {
    const {children} = props;

    return <Card.Body>{children}</Card.Body>;
}

function FeedCardRoot(props: IFeedCardRootProps) {
    const {children} = props;

    return (
        <Card.Root as="article" flexGrow="1">
            {children}
        </Card.Root>
    );
}

const FeedCard = {
    Body: FeedCardBody,
    Description: FeedCardDescription,
    Root: FeedCardRoot,
    Text: FeedCardText,
    Title: FeedCardTitle,
} as const;

export default FeedCard;
