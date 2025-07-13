import {Box} from "@chakra-ui/react";

import type {PropsWithChildren} from "react";

export interface IFullscreenHeroRootProps extends PropsWithChildren {}

function FullscreenHeroRoot(props: IFullscreenHeroRootProps) {
    const {children} = props;

    return (
        <Box
            as="section"
            display="flex"
            bg="bg.inverted"
            color="fg.inverted"
            paddingBlockStart="calc(var(--chakra-sizes-16) + var(--chakra-spacing-8) + (var(--chakra-spacing-2) * 2) + 2px)"
            blockSize="dvh"
        >
            {children}
        </Box>
    );
}

const FullscreenHero = {
    Root: FullscreenHeroRoot,
} as const;

export default FullscreenHero;
