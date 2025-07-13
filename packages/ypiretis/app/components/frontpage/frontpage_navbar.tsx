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
    usePopoverContext,
} from "@chakra-ui/react";

import type {PropsWithChildren} from "react";

import Links from "~/components/common/links";

import ChevronDownIcon from "~/components/icons/chevron_down_icon";
import ChevronUpIcon from "~/components/icons/chevron_up_icon";
import CloseIcon from "~/components/icons/close_icon";
import MenuIcon from "~/components/icons/menu_icon";

import {
    useAuthenticatedPublicUserContext,
    useOptionalPublicUserContext,
} from "~/state/public_user";

interface IFrontpageNavbarActionsDesktopProps extends PropsWithChildren {}

interface IFrontpageNavbarActionsDropdownProps extends PropsWithChildren {}

interface IFrontpageNavbarActionsBarProps extends PropsWithChildren {}

interface IFrontpageNavbarActionsRootProps extends PropsWithChildren {}

interface IFrontpageNavbarContainerProps extends PropsWithChildren {}

interface IFrontpageNavbarRootProps extends PropsWithChildren {}

function FrontpageNavbarLeftActions() {
    return (
        <>
            <Links.InternalLink to="/news">News</Links.InternalLink>

            <Links.InternalLink to="/events">Events</Links.InternalLink>
        </>
    );
}

function FrontpageNavbarRightActions() {
    return (
        <>
            <Links.InternalLink to="/engage" isNewTab>
                Engage
            </Links.InternalLink>

            <Links.InternalLink to="/discord" isNewTab>
                Discord
            </Links.InternalLink>
        </>
    );
}

function FrontpageNavbarLogo() {
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

function FrontpageNavbarAuthenticatedSessionLinks() {
    const {isAdmin} = useAuthenticatedPublicUserContext();

    return (
        <>
            <Links.InternalLink to="/rooms/join">Join Room</Links.InternalLink>

            <Links.InternalLink to="/rooms/create">
                Create Room
            </Links.InternalLink>

            <FrontpageNavbarDivider />

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

function FrontpageNavbarGuestSessionLinks() {
    return (
        <Links.InternalLink to="/authentication/log-in">
            Log In
        </Links.InternalLink>
    );
}

function FrontpageNavbarSessionGreeterButton() {
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

function FrontpageNavbarSessionGreeter() {
    return (
        <Popover.Root positioning={{placement: "bottom-end"}}>
            <FrontpageNavbarSessionGreeterButton />

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
            <VStack as="nav" gap="4">
                {children}
            </VStack>
        </Collapsible.Content>
    );
}

function FrontpageNavbarActionsBar(props: IFrontpageNavbarActionsBarProps) {
    const {children} = props;

    return (
        <HStack as="nav" gap="4" alignItems="center">
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
            as="header"
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
    const session = useOptionalPublicUserContext();

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
