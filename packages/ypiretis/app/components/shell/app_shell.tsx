import type {ColorPalette} from "@chakra-ui/react";
import {
    Box,
    Bleed,
    Button,
    Container,
    Image,
    Flex,
    VStack,
} from "@chakra-ui/react";

import type {MouseEventHandler, PropsWithChildren} from "react";

import type {To} from "react-router";
import {Link} from "react-router";

export interface IAppShellButtonProps extends PropsWithChildren {
    readonly colorPalette?: ColorPalette;

    readonly onClick: MouseEventHandler<HTMLButtonElement>;
}

export interface IAppShellIconProps extends PropsWithChildren {}

export interface IAppShellLinkProps extends PropsWithChildren {
    readonly active?: boolean;

    readonly to: To;
}

export interface IAppShellContainerProps extends PropsWithChildren {
    readonly fluid?: boolean;
}

export interface IAppShellRootProps extends PropsWithChildren {}

export interface IAppShellSidebarProps extends PropsWithChildren {}

function AppShellButton(props: IAppShellButtonProps) {
    const {children, colorPalette, onClick} = props;

    return (
        <Button
            variant="ghost"
            colorPalette={colorPalette}
            size="2xs"
            flexDirection="column"
            fontWeight="bold"
            width="full"
            paddingY="10"
            gap="2"
            onClick={onClick}
        >
            {children}
        </Button>
    );
}

function AppShellDivider() {
    return (
        <Box
            borderBlockStartColor="border"
            borderBlockStartStyle="solid"
            borderBlockStartWidth="thin"
            marginBlockStart="auto"
            width="full"
        />
    );
}

function AppShellIcon(props: IAppShellIconProps) {
    const {children} = props;

    return (
        <Box width="2.5em" height="2.5em" asChild>
            {children}
        </Box>
    );
}

function AppShellLink(props: IAppShellLinkProps) {
    const {active = false, children, to} = props;

    return (
        <Button
            variant="ghost"
            colorPalette={active ? "cyan" : undefined}
            size="2xs"
            flexDirection="column"
            fontWeight="bold"
            width="full"
            paddingY="10"
            gap="2"
            asChild
        >
            <Link to={to}>{children}</Link>
        </Button>
    );
}

function AppShellContainer(props: IAppShellContainerProps) {
    const {children, fluid = false} = props;

    return (
        <Box
            flexGrow="1"
            marginLeft="32"
            maxBlockSize={fluid ? undefined : "dvh"}
            minBlockSize={fluid ? undefined : "dvh"}
            overflowX="hidden"
            overflowY={fluid ? undefined : "hidden"}
        >
            <Container paddingBlock="4" minBlockSize="full">
                {children}
            </Container>
        </Box>
    );
}

function AppShellSidebar(props: IAppShellSidebarProps) {
    const {children} = props;

    return (
        <Box
            pos="fixed"
            bg="bg"
            borderInlineEndColor="border"
            borderInlineEndStyle="solid"
            borderInlineEndWidth="thin"
            blockSize="dvh"
            minInlineSize="32"
            maxInlineSize="32"
        >
            <VStack gap="2" padding="2" blockSize="full">
                <Bleed
                    blockStart="2"
                    inline="2"
                    bg="bg.inverted"
                    borderBlockEndColor="border"
                    borderBlockEndStyle="solid"
                    borderBlockEndWidth="thin"
                    padding="4"
                    alignSelf="stretch"
                >
                    <Image
                        src="/images/logo.prompt.webp"
                        marginInline="auto"
                        width="10"
                    />
                </Bleed>

                {children}
            </VStack>
        </Box>
    );
}

function AppShellRoot(props: IAppShellRootProps) {
    const {children} = props;

    return (
        <Flex align="stretch" inlineSize="dvw">
            {children}
        </Flex>
    );
}

const AppShell = {
    Button: AppShellButton,
    Container: AppShellContainer,
    Divider: AppShellDivider,
    Icon: AppShellIcon,
    Link: AppShellLink,
    Sidebar: AppShellSidebar,
    Root: AppShellRoot,
} as const;

export default AppShell;
