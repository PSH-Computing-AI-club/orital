import {Card, Container, Flex, SimpleGrid} from "@chakra-ui/react";

import type {PropsWithChildren} from "react";

export interface IFeedSectionGridProps extends PropsWithChildren {}

export interface IFeedSectionDescriptionProps extends PropsWithChildren {}

export interface IFeedSectionTitleProps extends PropsWithChildren {}

export interface IFeedSectionBodyProps extends PropsWithChildren {}

export interface IFeedSectionContainerProps extends PropsWithChildren {}

export interface IFeedSectionRootProps extends PropsWithChildren {}

function FeedSectionGrid(props: IFeedSectionGridProps) {
    const {children} = props;

    return (
        <SimpleGrid
            columns={{base: 3, lgDown: 2, mdDown: 1}}
            gap="8"
            marginBlockStart="4"
        >
            {children}
        </SimpleGrid>
    );
}

function FeedSectionDescription(props: IFeedSectionDescriptionProps) {
    const {children} = props;

    return (
        <Card.Description
            fontSize={{base: "2xl", lgDown: "xl"}}
            textAlign="center"
        >
            {children}
        </Card.Description>
    );
}

function FeedSectionTitle(props: IFeedSectionTitleProps) {
    const {children} = props;

    return (
        <Card.Title fontSize={{base: "4xl", lgDown: "3xl"}} textAlign="center">
            {children}
        </Card.Title>
    );
}

function FeedSectionBody(props: IFeedSectionBodyProps) {
    const {children} = props;

    return <Card.Body gap="4">{children}</Card.Body>;
}

function FeedSectionContainer(props: IFeedSectionContainerProps) {
    const {children} = props;

    return (
        <Container asChild>
            <Card.Root
                variant="subtle"
                gap="8"
                bg="transparent"
                overflow="hidden"
            >
                {children}
            </Card.Root>
        </Container>
    );
}

function FeedSectionRoot(props: IFeedSectionRootProps) {
    const {children} = props;

    return (
        <Flex
            alignItems="center"
            bg="bg.muted"
            color="fg.inverted"
            paddingBlock="8"
            paddingInline={{base: "4", lgDown: "0"}}
            minBlockSize="xl"
        >
            {children}
        </Flex>
    );
}

const FeedSection = {
    Body: FeedSectionBody,
    Container: FeedSectionContainer,
    Description: FeedSectionDescription,
    Grid: FeedSectionGrid,
    Root: FeedSectionRoot,
    Title: FeedSectionTitle,
} as const;

export default FeedSection;
