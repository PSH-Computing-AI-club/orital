import {Card, Text} from "@chakra-ui/react";

import type {PropsWithChildren} from "react";

export interface IFeedCardTextProps extends PropsWithChildren {}

export interface IFeedCardDescriptionProps extends PropsWithChildren {}

export interface IFeedCardTitleProps extends PropsWithChildren {}

export interface IFeedCardBodyProps extends PropsWithChildren {}

export interface IFeedCardRootProps extends PropsWithChildren {}

function FeedCardText(props: IFeedCardTextProps) {
    const {children} = props;

    return <Text marginBlockStart="4">{children}</Text>;
}

function FeedCardDescription(props: IFeedCardDescriptionProps) {
    const {children} = props;

    return <Card.Description>{children}</Card.Description>;
}

function FeedCardTitle(props: IFeedCardTitleProps) {
    const {children} = props;

    return <Card.Title>{children}</Card.Title>;
}

function FeedCardBody(props: IFeedCardBodyProps) {
    const {children} = props;

    return <Card.Body>{children}</Card.Body>;
}

function FeedCardRoot(props: IFeedCardRootProps) {
    const {children} = props;

    return <Card.Root as="article">{children}</Card.Root>;
}

const FeedCard = {
    Body: FeedCardBody,
    Description: FeedCardDescription,
    Root: FeedCardRoot,
    Text: FeedCardText,
    Title: FeedCardTitle,
} as const;

export default FeedCard;
