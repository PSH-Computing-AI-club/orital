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
    Spacer,
    VStack,
    useCollapsibleContext,
    usePopoverContext,
} from "@chakra-ui/react";

import type {PropsWithChildren} from "react";

import Links from "~/components/common/links";
import Separator from "~/components/common/separator";

import ChevronDownIcon from "~/components/icons/chevron_down_icon";
import ChevronUpIcon from "~/components/icons/chevron_up_icon";
import CloseIcon from "~/components/icons/close_icon";
import MenuIcon from "~/components/icons/menu_icon";

import {
    useAuthenticatedPublicUserContext,
    useOptionalPublicUserContext,
} from "~/state/public_user";

interface INavbarActionsDesktopProps extends PropsWithChildren {}

interface INavbarActionsDropdownProps extends PropsWithChildren {}

interface INavbarActionsBarProps extends PropsWithChildren {}

interface INavbarActionsRootProps extends PropsWithChildren {}

interface INavbarContainerProps extends PropsWithChildren {}

interface INavbarRootProps extends PropsWithChildren {}

function NavbarLeftActions() {
    return (
        <>
            <Links.InternalLink to="/news">News</Links.InternalLink>

            <Links.InternalLink to="/events">Events</Links.InternalLink>
        </>
    );
}

function NavbarRightActions() {
    return (
        <>
            <Links.InternalLink to="/discover-east" isNewTab>
                Discover East
            </Links.InternalLink>

            <Links.InternalLink to="/discord" isNewTab>
                Discord
            </Links.InternalLink>
        </>
    );
}

function NavbarLogo() {
    return (
        <Links.InternalLink to="/">
            <Image
                src="/images/logo.monochrome.light.webp"
                alt="Navbar 3D voxel art logo."
                objectFit="contain"
                blockSize="16"
            />
        </Links.InternalLink>
    );
}

function NavbarAuthenticatedSessionLinks() {
    const {isAdmin} = useAuthenticatedPublicUserContext();

    return (
        <>
            <Links.InternalLink to="/rooms/join">Join Room</Links.InternalLink>

            <Links.InternalLink to="/rooms/create">
                Create Room
            </Links.InternalLink>

            <Separator.Horizontal />

            {isAdmin ? (
                <Links.InternalLink to="/admin">Admin</Links.InternalLink>
            ) : undefined}

            <Links.InternalLink to="/user/settings">
                Settings
            </Links.InternalLink>

            <Links.InternalLink to="/authentication/log-out">
                Log Out
            </Links.InternalLink>
        </>
    );
}

function NavbarGuestSessionLinks() {
    return (
        <Links.InternalLink to="/authentication/log-in">
            Log In
        </Links.InternalLink>
    );
}

function NavbarSessionGreeterButton() {
    const {firstName, lastName} = useAuthenticatedPublicUserContext();
    const {open} = usePopoverContext();

    const abbreviatedLastName = `${lastName.slice(0, 1)}.`;

    return (
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
                <ChevronDownIcon visibility={open ? "hidden" : undefined} />
                <ChevronUpIcon
                    position="absolute"
                    insetInlineEnd="4"
                    visibility={open ? undefined : "hidden"}
                />
            </Button>
        </Popover.Trigger>
    );
}

function NavbarSessionGreeter() {
    return (
        <Popover.Root positioning={{placement: "bottom-end"}}>
            <NavbarSessionGreeterButton />

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
                                <NavbarAuthenticatedSessionLinks />
                            </VStack>
                        </Popover.Body>
                    </Popover.Content>
                </Popover.Positioner>
            </Portal>
        </Popover.Root>
    );
}

function NavbarDesktopActions(props: INavbarActionsDesktopProps) {
    const {children} = props;

    return (
        <Box display="contents" hideBelow="lg">
            {children}
        </Box>
    );
}

function NavbarActionsDropdownTrigger() {
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

function NavbarActionsDropdown(props: INavbarActionsDropdownProps) {
    const {children} = props;

    return (
        <Collapsible.Content
            hideFrom="lg"
            marginBlockStart="4"
            marginBlockEnd="1"
            asChild
        >
            <VStack as="nav" gap="4">
                {children}
            </VStack>
        </Collapsible.Content>
    );
}

function NavbarActionsBar(props: INavbarActionsBarProps) {
    const {children} = props;

    return (
        <HStack as="nav" gap="4" alignItems="center">
            {children}
        </HStack>
    );
}

function NavbarActionsRoot(props: INavbarActionsRootProps) {
    const {children} = props;

    return <Collapsible.Root flexGrow="1">{children}</Collapsible.Root>;
}

function NavbarContainer(props: INavbarContainerProps) {
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

function NavbarRoot(props: INavbarRootProps) {
    const {children} = props;

    return (
        <Box
            as="header"
            display="flex"
            pos="fixed"
            insetBlockStart="8"
            blockSize={{lgTo2xl: "20"}}
            minBlockSize={{lgDown: "20"}}
            inlineSize="full"
            paddingInline="8"
            userSelect="none"
            zIndex="2"
        >
            {children}
        </Box>
    );
}

export default function Navbar() {
    const session = useOptionalPublicUserContext();

    return (
        <>
            <NavbarRoot>
                <NavbarContainer>
                    <NavbarActionsRoot>
                        <NavbarActionsBar>
                            <NavbarActionsDropdownTrigger />

                            <Spacer />

                            <NavbarDesktopActions>
                                <NavbarLeftActions />
                            </NavbarDesktopActions>

                            <NavbarLogo />

                            <NavbarDesktopActions>
                                <NavbarRightActions />
                            </NavbarDesktopActions>

                            <Spacer />

                            <NavbarDesktopActions>
                                <Box position="absolute" right="8">
                                    {session ? (
                                        <NavbarSessionGreeter />
                                    ) : (
                                        <NavbarGuestSessionLinks />
                                    )}
                                </Box>
                            </NavbarDesktopActions>
                        </NavbarActionsBar>

                        <NavbarActionsDropdown>
                            <NavbarLeftActions />
                            <NavbarRightActions />

                            <Separator.Horizontal />

                            {session ? (
                                <NavbarAuthenticatedSessionLinks />
                            ) : (
                                <NavbarGuestSessionLinks />
                            )}
                        </NavbarActionsDropdown>
                    </NavbarActionsRoot>
                </NavbarContainer>
            </NavbarRoot>
        </>
    );
}
