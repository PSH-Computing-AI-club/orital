import {Box, Container, Drawer, Flex, IconButton} from "@chakra-ui/react";

import type {PropsWithChildren} from "react";

import MenuIcon from "~/components/icons/menu_icon";

export interface IAppShellContainerProps extends PropsWithChildren {
    readonly fluid?: boolean;
}

export interface IAppShellRootProps extends PropsWithChildren {}

function AppShellContainer(props: IAppShellContainerProps) {
    const {children, fluid = false} = props;

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

function AppShellRoot(props: IAppShellRootProps) {
    const {children} = props;

    return (
        <Drawer.Root placement="start">
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

const AppShell = {
    Container: AppShellContainer,
    Root: AppShellRoot,
} as const;

export default AppShell;
