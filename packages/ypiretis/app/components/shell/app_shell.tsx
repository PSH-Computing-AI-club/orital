import type {ColorPalette} from "@chakra-ui/react";
import {
    Box,
    Bleed,
    Button,
    Container,
    Drawer,
    Flex,
    IconButton,
    Image,
    Portal,
    VStack,
} from "@chakra-ui/react";

import type {MouseEventHandler, PropsWithChildren} from "react";

import type {To} from "react-router";
import {Link, useLocation} from "react-router";

import MenuIcon from "~/components/icons/menu_icon";

import {buildAppURL} from "~/utils/url";

interface IAppShellSidebarContainerProps extends PropsWithChildren {}

export interface IAppShellButtonProps extends PropsWithChildren {
    readonly colorPalette?: ColorPalette;

    readonly disabled?: boolean;

    readonly onClick: MouseEventHandler<HTMLButtonElement>;
}

export interface IAppShellIconProps extends PropsWithChildren {}

export interface IAppShellLinkProps extends PropsWithChildren {
    readonly colorPalette?: ColorPalette;

    readonly to: To;
}

export interface IAppShellContainerProps extends PropsWithChildren {
    readonly fluid?: boolean;
}

export interface IAppShellRootProps extends PropsWithChildren {}

export interface IAppShellSidebarProps extends PropsWithChildren {}

function AppShellButton(props: IAppShellButtonProps) {
    const {children, colorPalette, disabled = false, onClick} = props;

    return (
        <Button
            disabled={disabled}
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
    const {children, colorPalette, to} = props;
    const location = useLocation();

    const currentURL = buildAppURL(location);
    const toURL = buildAppURL(to);

    const isActive = currentURL.toString() === toURL.toString();
    const preferredColorPalette: ColorPalette | undefined = isActive
        ? "cyan"
        : undefined;

    return (
        <Button
            variant="ghost"
            colorPalette={colorPalette ?? preferredColorPalette}
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

function AppShellSidebarContainer(props: IAppShellSidebarContainerProps) {
    const {children} = props;

    return (
        <VStack gap="2" padding="2" blockSize="full">
            <Bleed blockStart="2" inline="2" paddingBlock="4">
                <Image
                    src="/images/logo.monochrome.dark.webp"
                    objectFit="contain"
                    marginInline="auto"
                    blockSize="16"
                />
            </Bleed>

            {children}
        </VStack>
    );
}

function AppShellSidebar(props: IAppShellSidebarProps) {
    const {children} = props;

    return (
        <>
            <Box
                hideBelow="lg"
                pos="fixed"
                bg="bg"
                borderInlineEndColor="border"
                borderInlineEndStyle="solid"
                borderInlineEndWidth="thin"
                blockSize="dvh"
                minInlineSize="32"
                maxInlineSize="32"
            >
                <AppShellSidebarContainer>{children}</AppShellSidebarContainer>
            </Box>

            <Portal>
                <Drawer.Backdrop hideFrom="lg" />

                <Drawer.Positioner hideFrom="lg">
                    <Drawer.CloseTrigger
                        position="fixed"
                        inset="0"
                        cursor="pointer"
                    />

                    <Drawer.Content minInlineSize="32" maxInlineSize="32">
                        <AppShellSidebarContainer>
                            {children}
                        </AppShellSidebarContainer>
                    </Drawer.Content>
                </Drawer.Positioner>
            </Portal>
        </>
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
    Button: AppShellButton,
    Container: AppShellContainer,
    Divider: AppShellDivider,
    Icon: AppShellIcon,
    Link: AppShellLink,
    Sidebar: AppShellSidebar,
    Root: AppShellRoot,
} as const;

export default AppShell;
