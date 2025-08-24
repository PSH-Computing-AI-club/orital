import {Card, Container, Flex, Grid, GridItem} from "@chakra-ui/react";

import type {PropsWithChildren} from "react";

export const FEED_SECTION_GRID_ITEM_VARIANTS = {
    action: "action",

    interface: "interface",
} as const;

export type IFeedSectionGridItemVariants =
    (typeof FEED_SECTION_GRID_ITEM_VARIANTS)[keyof typeof FEED_SECTION_GRID_ITEM_VARIANTS];

export interface IFeedSectionGridItemProps extends PropsWithChildren {
    readonly variant?: IFeedSectionGridItemVariants;
}

export interface IFeedSectionGridProps extends PropsWithChildren {}

export interface IFeedSectionDescriptionProps extends PropsWithChildren {}

export interface IFeedSectionTitleProps extends PropsWithChildren {}

export interface IFeedSectionBodyProps extends PropsWithChildren {}

export interface IFeedSectionContainerProps extends PropsWithChildren {}

export interface IFeedSectionRootProps extends PropsWithChildren {}

function getFeedSectionGridItemVariantStyle(
    variant?: IFeedSectionGridItemVariants,
) {
    switch (variant) {
        case FEED_SECTION_GRID_ITEM_VARIANTS.action:
            return ActionVariantFeedSectionGridItem;
    }

    return null;
}

function ActionVariantFeedSectionGridItem(props: PropsWithChildren) {
    const {children} = props;

    return (
        <GridItem
            alignSelf="center"
            justifySelf={{xlDown: "center"}}
            marginBlock={{mdDown: "4"}}
            marginInlineStart={{xl: "4"}}
            asChild
        >
            {children}
        </GridItem>
    );
}

function FeedSectionGridItem(props: IFeedSectionGridItemProps) {
    const {children, variant} = props;

    const Variant = getFeedSectionGridItemVariantStyle(variant);

    if (Variant) {
        return (
            <Variant>
                <GridItem as="li" display="flex" blockSize="3xs">
                    {children}
                </GridItem>
            </Variant>
        );
    }

    return (
        <GridItem as="li" display="flex" blockSize="3xs">
            {children}
        </GridItem>
    );
}

function FeedSectionGrid(props: IFeedSectionGridProps) {
    const {children} = props;

    return (
        <Grid
            as="ol"
            templateColumns={{
                base: "repeat(3, minmax(0, 1fr)) auto",
                xlDown: "repeat(2, minmax(0, 1fr))",
                mdDown: "repeat(1, minmax(0, 1fr))",
            }}
            gap="4"
            marginBlockStart="4"
        >
            {children}
        </Grid>
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
        <Card.Title
            as="h2"
            fontSize={{base: "4xl", lgDown: "3xl"}}
            textAlign="center"
        >
            {children}
        </Card.Title>
    );
}

function FeedSectionBody(props: IFeedSectionBodyProps) {
    const {children} = props;

    return (
        <Card.Body gap="4" paddingInline="unset">
            {children}
        </Card.Body>
    );
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
            as="section"
            alignItems="center"
            bg="bg.muted"
            color="fg"
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
    GridItem: FeedSectionGridItem,
    Root: FeedSectionRoot,
    Title: FeedSectionTitle,
} as const;

export default FeedSection;
