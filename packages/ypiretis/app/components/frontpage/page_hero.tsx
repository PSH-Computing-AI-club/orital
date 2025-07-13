import {Box, Container, Heading} from "@chakra-ui/react";

import type {PropsWithChildren} from "react";

export interface IPageHeroTextProps extends PropsWithChildren {}

export interface IPageHeroContainerProps extends PropsWithChildren {}

export interface IPageHeroRootProps extends PropsWithChildren {}

function PageHeroText(props: IPageHeroTextProps) {
    const {children} = props;

    return <Heading size={{base: "6xl", lgDown: "5xl"}}>{children}</Heading>;
}

function PageHeroContainer(props: IPageHeroContainerProps) {
    const {children} = props;

    return <Container>{children}</Container>;
}

function PageHeroRoot(props: IPageHeroRootProps) {
    const {children} = props;

    return (
        <Box
            display="flex"
            bg="bg.inverted"
            color="fg.inverted"
            paddingBlockStart="calc(var(--chakra-sizes-16) + var(--chakra-spacing-8) + (var(--chakra-spacing-2) * 2) + 2px + var(--chakra-sizes-8))"
            paddingBlockEnd="8"
        >
            {children}
        </Box>
    );
}

const PageHero = {
    Container: PageHeroContainer,
    Root: PageHeroRoot,
    Text: PageHeroText,
} as const;

export default PageHero;
