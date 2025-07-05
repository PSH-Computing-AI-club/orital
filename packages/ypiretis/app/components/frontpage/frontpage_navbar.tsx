import {
    Box,
    Button,
    Collapsible,
    Container,
    HStack,
    IconButton,
    Image,
    Popover,
    Portal,
    Separator,
    Spacer,
    VStack,
    useCollapsibleContext,
} from "@chakra-ui/react";

import type {PropsWithChildren} from "react";

import CloseIcon from "~/components/icons/close_icon";
import MenuIcon from "~/components/icons/menu_icon";

import FrontpageShell from "~/components/frontpage/frontpage_shell";

import {
    useAuthenticatedSessionContext,
    useOptionalSessionContext,
} from "~/state/session";

interface IFrontpageNavbarActionsDesktopProps extends PropsWithChildren {}

interface IFrontpageNavbarActionsDropdownProps extends PropsWithChildren {}

interface IFrontpageNavbarActionsBarProps extends PropsWithChildren {}

interface IFrontpageNavbarActionsRootProps extends PropsWithChildren {}

interface IFrontpageNavbarContainerProps extends PropsWithChildren {}

interface IFrontpageNavbarRootProps extends PropsWithChildren {}

function FrontpageNavbarLeftActions() {
    return (
        <>
            <FrontpageShell.InternalLink to="/news">
                News
            </FrontpageShell.InternalLink>

            <FrontpageShell.InternalLink to="/events">
                Events
            </FrontpageShell.InternalLink>
        </>
    );
}

function FrontpageNavbarRightActions() {
    return (
        <>
            <FrontpageShell.InternalLink to="/engage" isNewTab>
                Engage
            </FrontpageShell.InternalLink>

            <FrontpageShell.InternalLink to="/discord" isNewTab>
                Discord
            </FrontpageShell.InternalLink>
        </>
    );
}

function FrontpageNavbarLogo() {
    return (
        <FrontpageShell.InternalLink to="/">
            <Image
                objectFit="contain"
                blockSize="16"
                src="/images/logo.monochrome.light.webp"
            />
        </FrontpageShell.InternalLink>
    );
}

function FrontpageNavbarAuthenticatedSessionLinks() {
    return (
        <>
            <FrontpageShell.InternalLink to="/rooms/join">
                Join Room
            </FrontpageShell.InternalLink>

            <FrontpageShell.InternalLink to="/rooms/create">
                Create Room
            </FrontpageShell.InternalLink>

            <FrontpageNavbarDivider />

            <FrontpageShell.InternalLink to="/user/settings">
                Settings
            </FrontpageShell.InternalLink>

            <FrontpageShell.InternalLink to="/authentication/log-out">
                Log Out
            </FrontpageShell.InternalLink>
        </>
    );
}

function FrontpageNavbarGuestSessionLinks() {
    return (
        <FrontpageShell.InternalLink to="/authentication/log-in">
            Log In
        </FrontpageShell.InternalLink>
    );
}

function FrontpageNavbarSessionGreeter() {
    const {firstName, lastName} = useAuthenticatedSessionContext();

    const abbreviatedLastName = `${lastName.slice(0, 1)}.`;

    return (
        <Popover.Root positioning={{placement: "bottom-end"}}>
            <Popover.Trigger asChild>
                <Button
                    variant="ghost"
                    color="currentcolor"
                    fontSize="inherit"
                    css={{
                        "&[data-state=open]": {bg: "fg.muted"},
                    }}
                    _hover={{bg: "fg.muted"}}
                >
                    Welcome, {firstName} {abbreviatedLastName}!
                </Button>
            </Popover.Trigger>

            <Portal>
                <Popover.Positioner visibility={{lgDown: "collapse"}}>
                    <Popover.Content
                        bg="gray.fg"
                        width="unset"
                        borderColor="border.inverted"
                        borderStyle="solid"
                        borderWidth="thin"
                        color="fg.inverted"
                        boxShadow="none"
                    >
                        <Popover.Body paddingBlock="4" paddingInline="8">
                            <VStack gap="4">
                                <FrontpageNavbarAuthenticatedSessionLinks />
                            </VStack>
                        </Popover.Body>
                    </Popover.Content>
                </Popover.Positioner>
            </Portal>
        </Popover.Root>
    );
}

function FrontpageNavbarDivider() {
    return (
        <Separator borderColor="currentcolor" inlineSize="full" opacity="0.2" />
    );
}

function FrontpageNavbarDesktopActions(
    props: IFrontpageNavbarActionsDesktopProps,
) {
    const {children} = props;

    return (
        <Box display="contents" hideBelow="lg">
            {children}
        </Box>
    );
}

function FrontpageNavbarActionsDropdownTrigger() {
    const {open} = useCollapsibleContext();

    return (
        <Collapsible.Trigger asChild>
            <IconButton
                position="absolute"
                variant="ghost"
                color="currentcolor"
                hideFrom="lg"
                css={{
                    "&[data-state=open]": {bg: "fg.muted"},
                }}
                _hover={{bg: "fg.muted"}}
            >
                <CloseIcon visibility={open ? undefined : "collapse"} />
                <MenuIcon
                    position="absolute"
                    visibility={open ? "collapse" : undefined}
                />
            </IconButton>
        </Collapsible.Trigger>
    );
}

function FrontpageNavbarActionsDropdown(
    props: IFrontpageNavbarActionsDropdownProps,
) {
    const {children} = props;

    return (
        <Collapsible.Content
            hideFrom="lg"
            marginBlockStart="4"
            marginBlockEnd="1"
            asChild
        >
            <VStack gap="4">{children}</VStack>
        </Collapsible.Content>
    );
}

function FrontpageNavbarActionsBar(props: IFrontpageNavbarActionsBarProps) {
    const {children} = props;

    return (
        <HStack gap="4" alignItems="center">
            {children}
        </HStack>
    );
}

function FrontpageNavbarActionsRoot(props: IFrontpageNavbarActionsRootProps) {
    const {children} = props;

    return <Collapsible.Root flexGrow="1">{children}</Collapsible.Root>;
}

function FrontpageNavbarContainer(props: IFrontpageNavbarContainerProps) {
    const {children} = props;

    return (
        <Container
            display="flex"
            paddingBlock="2"
            bg="gray.solid"
            borderColor="border.inverted"
            borderStyle="solid"
            borderWidth="thin"
            color="fg.inverted"
        >
            {children}
        </Container>
    );
}

function FrontpageNavbarRoot(props: IFrontpageNavbarRootProps) {
    const {children} = props;

    return (
        <Box
            display="flex"
            pos="fixed"
            insetBlockStart="8"
            blockSize={{lgTo2xl: "20"}}
            minBlockSize={{lgDown: "20"}}
            inlineSize="full"
            paddingInline="8"
            zIndex="2"
        >
            {children}
        </Box>
    );
}

export default function FrontpageNavbar() {
    const session = useOptionalSessionContext();

    return (
        <>
            <FrontpageNavbarRoot>
                <FrontpageNavbarContainer>
                    <FrontpageNavbarActionsRoot>
                        <FrontpageNavbarActionsBar>
                            <FrontpageNavbarActionsDropdownTrigger />

                            <Spacer />

                            <FrontpageNavbarDesktopActions>
                                <FrontpageNavbarLeftActions />
                            </FrontpageNavbarDesktopActions>

                            <FrontpageNavbarLogo />

                            <FrontpageNavbarDesktopActions>
                                <FrontpageNavbarRightActions />
                            </FrontpageNavbarDesktopActions>

                            <Spacer />

                            <FrontpageNavbarDesktopActions>
                                <Box position="absolute" right="8">
                                    {session ? (
                                        <FrontpageNavbarSessionGreeter />
                                    ) : (
                                        <FrontpageNavbarGuestSessionLinks />
                                    )}
                                </Box>
                            </FrontpageNavbarDesktopActions>
                        </FrontpageNavbarActionsBar>

                        <FrontpageNavbarActionsDropdown>
                            <FrontpageNavbarLeftActions />
                            <FrontpageNavbarRightActions />

                            <FrontpageNavbarDivider />

                            {session ? (
                                <FrontpageNavbarAuthenticatedSessionLinks />
                            ) : (
                                <FrontpageNavbarGuestSessionLinks />
                            )}
                        </FrontpageNavbarActionsDropdown>
                    </FrontpageNavbarActionsRoot>
                </FrontpageNavbarContainer>
            </FrontpageNavbarRoot>
        </>
    );
}
