import {
    Box,
    Collapsible,
    Container,
    IconButton,
    Image,
    HStack,
    Spacer,
    VStack,
    useCollapsibleContext,
} from "@chakra-ui/react";

import type {PropsWithChildren} from "react";

import CloseIcon from "~/components/icons/close_icon";
import MenuIcon from "~/components/icons/menu_icon";
import FrontpageShell from "~/components/frontpage/frontpage_shell";

interface IFrontpageNavbarActionsDesktopProps extends PropsWithChildren {}

interface IFrontpageNavbarActionsDropdownProps extends PropsWithChildren {}

interface IFrontpageNavbarActionsBarProps extends PropsWithChildren {}

interface IFrontpageNavbarActionsRootProps extends PropsWithChildren {}

interface IFrontpageNavbarContainerProps extends PropsWithChildren {}

interface IFrontpageNavbarRootProps extends PropsWithChildren {}

function FrontpageNavbarLeftLinks() {
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

function FrontpageNavbarRightLinks() {
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

function FrontpageNavbarActionsTrigger() {
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

function FrontpageNavbarActionsDesktop(
    props: IFrontpageNavbarActionsDesktopProps,
) {
    const {children} = props;

    return (
        <Box display="contents" hideBelow="lg">
            {children}
        </Box>
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
    return (
        <>
            <FrontpageNavbarRoot>
                <FrontpageNavbarContainer>
                    <FrontpageNavbarActionsRoot>
                        <FrontpageNavbarActionsBar>
                            <FrontpageNavbarActionsTrigger />

                            <Spacer />

                            <FrontpageNavbarActionsDesktop>
                                <FrontpageNavbarLeftLinks />
                            </FrontpageNavbarActionsDesktop>

                            <FrontpageNavbarLogo />

                            <FrontpageNavbarActionsDesktop>
                                <FrontpageNavbarRightLinks />
                            </FrontpageNavbarActionsDesktop>

                            <Spacer />
                        </FrontpageNavbarActionsBar>

                        <FrontpageNavbarActionsDropdown>
                            <FrontpageNavbarLeftLinks />
                            <FrontpageNavbarRightLinks />
                        </FrontpageNavbarActionsDropdown>
                    </FrontpageNavbarActionsRoot>
                </FrontpageNavbarContainer>
            </FrontpageNavbarRoot>
        </>
    );
}
