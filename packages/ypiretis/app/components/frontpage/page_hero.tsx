import {Box, Heading} from "@chakra-ui/react";

import type {PropsWithChildren} from "react";

export interface IPageHeroTextProps extends PropsWithChildren {}

export interface IPageHeroRootProps extends PropsWithChildren {}

function PageHeroText(props: IPageHeroTextProps) {
    const {children} = props;

    return <Heading size={{base: "6xl", lgDown: "5xl"}}>{children}</Heading>;
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
            paddingInline="4"
        >
            {children}
        </Box>
    );
}

const PageHero = {
    Root: PageHeroRoot,
    Text: PageHeroText,
} as const;

export default PageHero;
