import type {BoxProps, DrawerRootProps} from "@chakra-ui/react";
import {Box, Container, Drawer, Flex, IconButton} from "@chakra-ui/react";

import MenuIcon from "~/components/icons/menu_icon";

export interface ILayoutFixedContainerProps extends BoxProps {}

export interface ILayoutFluidContainerProps extends BoxProps {}

export interface ILayoutRootProps extends DrawerRootProps {}

function LayoutFixedContainer(props: ILayoutFixedContainerProps) {
    const {children, ...rest} = props;

    return (
        <Box
            display="flex"
            flexDirection="column"
            flexGrow="1"
            marginInlineStart={{base: "32", lgDown: "0"}}
            maxBlockSize="dvh"
            minBlockSize="dvh"
            overflowX="hidden"
            overflowY="hidden"
            {...rest}
        >
            <Container
                display="flex"
                flexDirection="column"
                gap="4"
                flexGrow="1"
                maxBlockSize="full"
                overflow="hidden"
                paddingBlock="4"
            >
                {children}
            </Container>
        </Box>
    );
}

function LayoutFluidContainer(props: ILayoutFluidContainerProps) {
    const {children, ...rest} = props;

    return (
        <Box
            flexGrow="1"
            marginInlineStart={{base: "32", lgDown: "0"}}
            overflowX="hidden"
            {...rest}
        >
            <Container
                display="flex"
                flexDirection="column"
                gap="4"
                paddingBlock="4"
            >
                {children}
            </Container>
        </Box>
    );
}

function LayoutRoot(props: ILayoutRootProps) {
    const {children, ...rest} = props;

    return (
        <Drawer.Root placement="start" {...rest}>
            <Flex align="stretch" inlineSize="dvw">
                {children}
            </Flex>

            <Drawer.Trigger asChild>
                <IconButton
                    hideFrom="lg"
                    colorPalette="cyan"
                    position="fixed"
                    insetBlockEnd="2"
                    insetInlineEnd="2"
                >
                    <MenuIcon />
                </IconButton>
            </Drawer.Trigger>
        </Drawer.Root>
    );
}

const Layout = {
    FixedContainer: LayoutFixedContainer,
    FluidContainer: LayoutFluidContainer,
    Root: LayoutRoot,
} as const;

export default Layout;
