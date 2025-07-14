import {Box, Card, Container, Flex, SimpleGrid} from "@chakra-ui/react";

import type {PropsWithChildren} from "react";

export interface IPeopleSectionGridItemProps extends PropsWithChildren {}

export interface IPeopleSectionGridProps extends PropsWithChildren {}

export interface IPeopleSectionDescriptionProps extends PropsWithChildren {}

export interface IPeopleSectionTitleProps extends PropsWithChildren {}

export interface IPeopleSectionBodyProps extends PropsWithChildren {}

export interface IPeopleSectionContainerProps extends PropsWithChildren {}

export interface IPeopleSectionRootProps extends PropsWithChildren {}

function PeopleSectionGridItem(props: IPeopleSectionGridItemProps) {
    const {children} = props;

    return <Box as="li">{children}</Box>;
}

function PeopleSectionGrid(props: IPeopleSectionGridProps) {
    const {children} = props;

    return (
        <SimpleGrid
            as="ol"
            columns={{base: 4, xlDown: 2, mdDown: 1}}
            gap="8"
            marginBlockStart="8"
        >
            {children}
        </SimpleGrid>
    );
}

function PeopleSectionDescription(props: IPeopleSectionDescriptionProps) {
    const {children} = props;

    return (
        <Card.Description
            color="fg.subtle"
            fontSize={{base: "2xl", lgDown: "xl"}}
            textAlign="center"
        >
            {children}
        </Card.Description>
    );
}

function PeopleSectionTitle(props: IPeopleSectionTitleProps) {
    const {children} = props;

    return (
        <Card.Title
            as="h2"
            color="fg.inverted"
            fontSize={{base: "4xl", lgDown: "3xl"}}
            textAlign="center"
        >
            {children}
        </Card.Title>
    );
}

function PeopleSectionBody(props: IPeopleSectionBodyProps) {
    const {children} = props;

    return (
        <Card.Body gap="4" padding="unset">
            {children}
        </Card.Body>
    );
}

function PeopleSectionContainer(props: IPeopleSectionContainerProps) {
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

function PeopleSectionRoot(props: IPeopleSectionRootProps) {
    const {children} = props;

    return (
        <Flex
            as="section"
            alignItems="center"
            bg="bg.inverted"
            color="fg.inverted"
            paddingBlock="8"
            paddingInline={{base: "4", lgDown: "0"}}
            minBlockSize="xl"
        >
            {children}
        </Flex>
    );
}

const PeopleSection = {
    Body: PeopleSectionBody,
    Container: PeopleSectionContainer,
    Description: PeopleSectionDescription,
    Grid: PeopleSectionGrid,
    GridItem: PeopleSectionGridItem,
    Root: PeopleSectionRoot,
    Title: PeopleSectionTitle,
} as const;

export default PeopleSection;
