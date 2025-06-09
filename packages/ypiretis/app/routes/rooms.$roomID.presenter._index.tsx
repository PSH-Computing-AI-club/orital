import type {ButtonProps} from "@chakra-ui/react";
import {
    Box,
    Button,
    Card,
    Grid,
    GridItem,
    HStack,
    PinInput,
} from "@chakra-ui/react";

import type {PropsWithChildren} from "react";

import type {IRoomStates} from "~/.server/services/room_service";

import ExternalLinkIcon from "~/components/icons/external_link_icon";
import LockIcon from "~/components/icons/lock_icon";
import LockOpenIcon from "~/components/icons/lock_open_icon";
import NotificationIcon from "~/components/icons/notification_icon";
import PinIcon from "~/components/icons/pin_icon";
import ReloadIcon from "~/components/icons/reload_icon";
import ShieldIcon from "~/components/icons/shield_icon";
import UsersIcon from "~/components/icons/users_icon";

import AppShell from "~/components/shell/app_shell";

import {usePresenterContext} from "~/state/presenter";

import {Route} from "./+types/rooms.$roomID.presenter._index";

function AttendeesCard() {
    return (
        <>
            <Card.Body gap="4">
                <Card.Title
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                >
                    Attendees
                    <UsersIcon />
                </Card.Title>

                <Card.Description>blahblahlblah</Card.Description>
            </Card.Body>
        </>
    );
}

function PinCard() {
    const {pin, state} = usePresenterContext();

    return (
        <>
            <Card.Body gap="4">
                <Card.Title
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                >
                    Room PIN
                    <PinIcon />
                </Card.Title>

                <PinInput.Root
                    value={Array.from(pin)}
                    type="alphanumeric"
                    size="2xl"
                    pointerEvents="none"
                    readOnly
                >
                    <PinInput.Control
                        display="flex"
                        justifyContent="space-evenly"
                    >
                        <PinInput.Input index={0} readOnly />
                        <PinInput.Input index={1} readOnly />
                        <PinInput.Input index={2} readOnly />
                        <PinInput.Input index={3} readOnly />
                        <PinInput.Input index={4} readOnly />
                        <PinInput.Input index={5} readOnly />
                    </PinInput.Control>
                </PinInput.Root>
            </Card.Body>

            <Card.Footer>
                <Button
                    disabled={state === "STATE_DISPOSED"}
                    colorPalette="red"
                >
                    Regenerate
                    <ReloadIcon />
                </Button>

                <Button
                    disabled={state === "STATE_DISPOSED"}
                    colorPalette="cyan"
                    flexGrow="1"
                >
                    QR Code
                    <ExternalLinkIcon />
                </Button>
            </Card.Footer>
        </>
    );
}

function StateCardButton(props: ButtonProps & {active?: boolean}) {
    const {
        active = false,
        children,
        flexDirection = "column",
        fontWeight = "bold",
        gap = "2",
        height = "32",
        size = "md",
        width = "32",
        ...rest
    } = props;

    return (
        <Button
            variant={active ? "solid" : "ghost"}
            size={size}
            flexDirection={flexDirection}
            fontWeight={fontWeight}
            gap={gap}
            width={width}
            height={height}
            {...rest}
        >
            {children}
        </Button>
    );
}

function StateCardIcon(props: PropsWithChildren) {
    const {children} = props;

    return (
        <Box width="2.5em" height="2.5em" asChild>
            {children}
        </Box>
    );
}

function StateCard() {
    const {state} = usePresenterContext();

    function onStateClick(newState: IRoomStates): void {
        if (state === newState) {
            return;
        }

        console.log({state: newState});
    }

    return (
        <>
            <Card.Body gap="4">
                <Card.Title
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                >
                    Room State
                    <ShieldIcon />
                </Card.Title>

                <HStack justifyContent="space-evenly">
                    <StateCardButton
                        active={state === "STATE_LOCKED"}
                        disabled={state === "STATE_DISPOSED"}
                        colorPalette="red"
                        onClick={() => onStateClick("STATE_LOCKED")}
                    >
                        <StateCardIcon>
                            <LockIcon />
                        </StateCardIcon>
                        Locked
                    </StateCardButton>

                    <StateCardButton
                        active={state === "STATE_UNLOCKED"}
                        disabled={state === "STATE_DISPOSED"}
                        colorPalette="green"
                        onClick={() => onStateClick("STATE_UNLOCKED")}
                    >
                        <StateCardIcon>
                            <LockOpenIcon />
                        </StateCardIcon>
                        Unlocked
                    </StateCardButton>

                    <StateCardButton
                        active={state === "STATE_PERMISSIVE"}
                        disabled={state === "STATE_DISPOSED"}
                        colorPalette="yellow"
                        onClick={() => onStateClick("STATE_PERMISSIVE")}
                    >
                        <StateCardIcon>
                            <NotificationIcon />
                        </StateCardIcon>
                        Permissive
                    </StateCardButton>
                </HStack>
            </Card.Body>
        </>
    );
}

export default function RoomsPresenterIndex(props: Route.ComponentProps) {
    const {title} = usePresenterContext();

    return (
        <AppShell.Container title={title}>
            <Grid
                templateRows="auto 1fr"
                templateColumns="1fr 1fr"
                columnGap="8"
                rowGap="4"
                blockSize="full"
            >
                <Card.Root>
                    <PinCard />
                </Card.Root>

                <Card.Root>
                    <StateCard />
                </Card.Root>

                <GridItem colSpan={2}>
                    <Card.Root blockSize="full">
                        <AttendeesCard />
                    </Card.Root>
                </GridItem>
            </Grid>
        </AppShell.Container>
    );
}
