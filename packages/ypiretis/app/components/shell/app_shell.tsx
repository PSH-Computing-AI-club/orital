import type {ColorPalette, EditableValueChangeDetails} from "@chakra-ui/react";
import {
    Box,
    Bleed,
    Button,
    Container,
    Drawer,
    Editable,
    Flex,
    Heading,
    IconButton,
    Image,
    Portal,
    VStack,
} from "@chakra-ui/react";

import type {MouseEventHandler, PropsWithChildren} from "react";
import {useState} from "react";

import {useLocation} from "react-router";

import CheckIcon from "~/components/icons/check_icon";
import CloseIcon from "~/components/icons/close_icon";
import EditBoxIcon from "~/components/icons/edit_box_icon";
import MenuIcon from "~/components/icons/menu_icon";

import {APP_NAME} from "~/utils/constants";
import {buildAppURL} from "~/utils/url";

import type {To} from "react-router";
import {Link} from "react-router";

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

export interface IAppShellTitleProps {
    readonly title: string;
}

export interface IAppShellEditableTitleProps extends IAppShellTitleProps {
    readonly disabled?: boolean;

    readonly maxLength?: number;

    readonly onTitleCommit: (details: EditableValueChangeDetails) => void;

    readonly onTitleIsValid?: (details: EditableValueChangeDetails) => boolean;
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

function AppShellTitle(props: IAppShellTitleProps) {
    const {title} = props;

    return (
        <>
            {
                // **HACK:** React's special handling of the `<title>` element
                // requires that it has no child elements. That is, it is only
                // a singular primitive value.
            }
            <title>{`${title} :: ${APP_NAME}`}</title>
        </>
    );
}

function AppShellEditableTitle(props: IAppShellEditableTitleProps) {
    const {
        disabled = false,
        onTitleCommit,
        onTitleIsValid,
        maxLength,
        title,
    } = props;

    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [isValid, setIsValid] = useState<boolean>(true);

    // **HACK:** `Editable.RootProps.value` controls the display value AND
    // the value passed to `onValueCommit`. Thereforce, we need to run a
    // virtual value state based off the change event to fake our own
    // `onTitleCommit` event.
    //
    // Yay~!
    const [value, setValue] = useState<string>(title);

    function onEditChange(details: {edit: boolean}): void {
        setIsEditing(details.edit);
    }

    function onValueChange(details: EditableValueChangeDetails): void {
        setIsValid(onTitleIsValid!(details));

        setValue(details.value);
    }

    function onValueCommit(_details: EditableValueChangeDetails): void {
        onTitleCommit({value});
    }

    return (
        <>
            {
                // **HACK:** See similar comment for `AppShellTitle`.
            }
            <title>{`${title} :: ${APP_NAME}`}</title>

            <Heading>
                <Editable.Root
                    disabled={disabled}
                    value={title}
                    activationMode="dblclick"
                    submitMode={isValid ? "enter" : "none"}
                    maxLength={maxLength}
                    colorPalette={
                        isEditing ? (isValid ? undefined : "red") : undefined
                    }
                    fontSize="inherit"
                    lineHeight="inherit"
                    onEditChange={onEditChange}
                    onValueChange={onTitleIsValid ? onValueChange : undefined}
                    onValueCommit={onValueCommit}
                >
                    <Editable.Preview />
                    <Editable.Input />

                    <Editable.Control>
                        <Editable.EditTrigger asChild>
                            <IconButton variant="ghost" colorPalette="cyan">
                                <EditBoxIcon />
                            </IconButton>
                        </Editable.EditTrigger>

                        <Editable.CancelTrigger asChild>
                            <IconButton variant="outline" colorPalette="red">
                                <CloseIcon />
                            </IconButton>
                        </Editable.CancelTrigger>

                        <Editable.SubmitTrigger asChild>
                            <IconButton
                                disabled={!isValid || disabled}
                                variant="outline"
                                colorPalette="green"
                            >
                                <CheckIcon />
                            </IconButton>
                        </Editable.SubmitTrigger>
                    </Editable.Control>
                </Editable.Root>
            </Heading>
        </>
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
    EditableTitle: AppShellEditableTitle,
    Icon: AppShellIcon,
    Link: AppShellLink,
    Sidebar: AppShellSidebar,
    Root: AppShellRoot,
    Title: AppShellTitle,
} as const;

export default AppShell;
