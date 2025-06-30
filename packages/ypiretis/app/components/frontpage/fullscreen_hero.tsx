import {Bleed, Box} from "@chakra-ui/react";

import type {PropsWithChildren} from "react";

export interface IFullscreenHeroRootProps extends PropsWithChildren {}

function FullscreenHeroRoot(props: IFullscreenHeroRootProps) {
    const {children} = props;

    return (
        <Bleed blockStart="20" asChild>
            <Box
                display="flex"
                bg="bg.inverted"
                color="fg.inverted"
                paddingBlockStart="calc(var(--chakra-sizes-16) + var(--chakra-spacing-8))"
                blockSize="dvh"
            >
                {children}
            </Box>
        </Bleed>
    );
}

const FullscreenHero = {
    Root: FullscreenHeroRoot,
} as const;

export default FullscreenHero;
