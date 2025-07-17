import type {
    BoxProps,
    ButtonProps,
    ColorPalette,
    StackProps,
} from "@chakra-ui/react";
import {
    Box,
    Bleed,
    Button,
    Drawer,
    Image,
    Portal,
    VStack,
} from "@chakra-ui/react";

import type {MouseEventHandler, PropsWithChildren} from "react";

import type {To} from "react-router";
import {useLocation} from "react-router";

import Links from "~/components/common/links";

import {buildAppURL} from "~/utils/url";

export interface ISidebarButtonProps extends ButtonProps {
    readonly colorPalette?: ColorPalette;

    readonly disabled?: boolean;

    readonly onClick: MouseEventHandler<HTMLButtonElement>;
}

export interface ISidebarIconProps extends BoxProps {}

export interface ISidebarLinkProps extends ButtonProps {
    readonly colorPalette?: ColorPalette;

    readonly to: To;
}

export interface ISidebarContainerProps extends StackProps {
    readonly fluid?: boolean;
}

export interface ISidebarRootProps extends BoxProps {}

function SidebarIcon(props: ISidebarIconProps) {
    const {children, ...rest} = props;

    return (
        <Box width="2.5em" height="2.5em" asChild {...rest}>
            {children}
        </Box>
    );
}

function SidebarButton(props: ISidebarButtonProps) {
    const {children, colorPalette, disabled = false, onClick, ...rest} = props;

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
            {...rest}
        >
            {children}
        </Button>
    );
}

function SidebarLink(props: ISidebarLinkProps) {
    const {children, colorPalette, to, ...rest} = props;
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
            {...rest}
        >
            <Links.InternalLink variant="plain" to={to}>
                {children}
            </Links.InternalLink>
        </Button>
    );
}

function SidebarContainer(props: ISidebarContainerProps) {
    const {children, ...rest} = props;

    return (
        <VStack gap="2" padding="2" blockSize="full" {...rest}>
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

function SidebarRoot(props: ISidebarRootProps) {
    const {children, ...rest} = props;

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
                {...rest}
            >
                {children}
            </Box>

            <Portal>
                <Drawer.Backdrop hideFrom="lg" />

                <Drawer.Positioner hideFrom="lg">
                    <Drawer.CloseTrigger
                        position="fixed"
                        inset="0"
                        cursor="pointer"
                    />

                    <Drawer.Content
                        minInlineSize="32"
                        maxInlineSize="32"
                        {...rest}
                    >
                        {children}
                    </Drawer.Content>
                </Drawer.Positioner>
            </Portal>
        </>
    );
}

export const Sidebar = {
    Button: SidebarButton,
    Container: SidebarContainer,
    Icon: SidebarIcon,
    Link: SidebarLink,
    Root: SidebarRoot,
} as const;

export default Sidebar;
