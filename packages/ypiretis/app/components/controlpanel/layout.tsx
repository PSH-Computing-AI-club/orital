import type {BoxProps, DrawerRootProps} from "@chakra-ui/react";
import {Box, Container, Drawer, Flex, IconButton} from "@chakra-ui/react";

import MenuIcon from "~/components/icons/menu_icon";

export interface ILayoutContainerProps extends BoxProps {
    readonly fluid?: boolean;
}

export interface ILayoutRootProps extends DrawerRootProps {}

function LayoutContainer(props: ILayoutContainerProps) {
    const {children, fluid = false, ...rest} = props;

    return (
        <Box
            display={fluid ? undefined : "flex"}
            flexDirection={fluid ? undefined : "column"}
            flexGrow="1"
            marginInlineStart={{base: "32", lgDown: "0"}}
            maxBlockSize={fluid ? undefined : "dvh"}
            minBlockSize={fluid ? undefined : "dvh"}
            overflowX="hidden"
            overflowY={fluid ? undefined : "hidden"}
            {...rest}
        >
            <Container
                display="flex"
                flexDirection="column"
                gap="4"
                flexGrow={fluid ? undefined : "1"}
                maxBlockSize={fluid ? undefined : "full"}
                overflow={fluid ? undefined : "hidden"}
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
    Container: LayoutContainer,
    Root: LayoutRoot,
} as const;

export default Layout;
