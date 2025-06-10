import type {ButtonProps, EditableValueChangeDetails} from "@chakra-ui/react";
import {
    Box,
    Button,
    Card,
    Grid,
    GridItem,
    SimpleGrid,
    PinInput,
} from "@chakra-ui/react";

import type {MouseEvent, PropsWithChildren} from "react";
import {useState} from "react";

import * as v from "valibot";

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

import {buildFormData} from "~/utils/forms";
import {title} from "~/utils/valibot";

import type {IActionFormData as IPINActionFormData} from "./rooms_.$roomID_.presenter_.actions_.room_.pin";
import type {IActionFormData as IStateActionFormData} from "./rooms_.$roomID_.presenter_.actions_.room_.state";
import type {IActionFormData as ITitleActionFormData} from "./rooms_.$roomID_.presenter_.actions_.room_.title";

import {Route} from "./+types/rooms.$roomID.presenter._index";

const UX_TITLE_SCHEMA = v.pipe(
    v.string(),
    v.minLength(1),
    v.maxLength(32),
    title,
);

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

    const [fetchingAction, setFetchingAction] = useState<boolean>(false);

    async function onRegenerateClick(
        _event: MouseEvent<HTMLButtonElement, globalThis.MouseEvent>,
    ): Promise<void> {
        setFetchingAction(true);

        await fetch("./presenter/actions/room/pin", {
            method: "POST",
            body: buildFormData<IPINActionFormData>({
                action: "regenerate",
            }),
        });

        setFetchingAction(false);
    }

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
                    fontFamily="mono"
                    size={{base: "2xl", xlDown: "xl", lgDown: "lg"}}
                    pointerEvents="none"
                    readOnly
                >
                    <PinInput.Control
                        display="flex"
                        justifyContent="space-around"
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
                    disabled={fetchingAction || state === "STATE_DISPOSED"}
                    colorPalette="red"
                    onClick={(event) => onRegenerateClick(event)}
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
        blockSize = "full",
        children,
        flexDirection = "column",
        fontWeight = "bold",
        gap = "2",

        size = {base: "lg", xlDown: "md", lgDown: "sm"},

        ...rest
    } = props;

    return (
        <Button
            variant={active ? "solid" : "ghost"}
            size={size}
            flexDirection={flexDirection}
            fontWeight={fontWeight}
            gap={gap}
            blockSize={blockSize}
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

    const [fetchingAction, setFetchingAction] = useState<boolean>(false);

    async function onStateClick(
        _event: MouseEvent<HTMLButtonElement, globalThis.MouseEvent>,
        newState: Exclude<IRoomStates, "STATE_DISPOSED">,
    ): Promise<void> {
        if (state === newState) {
            return;
        }

        setFetchingAction(true);

        await fetch("./presenter/actions/room/state", {
            method: "POST",
            body: buildFormData<IStateActionFormData>({
                action: "update",
                state: newState,
            }),
        });

        setFetchingAction(false);
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

                <SimpleGrid
                    columns={3}
                    gap="2"
                    justifyContent="space-around"
                    blockSize="full"
                >
                    <StateCardButton
                        active={state === "STATE_LOCKED"}
                        disabled={fetchingAction || state === "STATE_DISPOSED"}
                        colorPalette="red"
                        onClick={(event) => onStateClick(event, "STATE_LOCKED")}
                    >
                        <StateCardIcon>
                            <LockIcon />
                        </StateCardIcon>
                        Locked
                    </StateCardButton>

                    <StateCardButton
                        active={state === "STATE_UNLOCKED"}
                        disabled={fetchingAction || state === "STATE_DISPOSED"}
                        colorPalette="green"
                        onClick={(event) =>
                            onStateClick(event, "STATE_UNLOCKED")
                        }
                    >
                        <StateCardIcon>
                            <LockOpenIcon />
                        </StateCardIcon>
                        Unlocked
                    </StateCardButton>

                    <StateCardButton
                        active={state === "STATE_PERMISSIVE"}
                        disabled={fetchingAction || state === "STATE_DISPOSED"}
                        colorPalette="yellow"
                        onClick={(event) =>
                            onStateClick(event, "STATE_PERMISSIVE")
                        }
                    >
                        <StateCardIcon>
                            <NotificationIcon />
                        </StateCardIcon>
                        Permissive
                    </StateCardButton>
                </SimpleGrid>
            </Card.Body>
        </>
    );
}

export default function RoomsPresenterIndex(_props: Route.ComponentProps) {
    const {title} = usePresenterContext();

    const [fetchingAction, setFetchingAction] = useState<boolean>(false);

    async function onTitleCommit(
        details: EditableValueChangeDetails,
    ): Promise<void> {
        const {value: newTitle} = details;

        if (title === newTitle) {
            return;
        }

        setFetchingAction(true);

        await fetch("./presenter/actions/room/title", {
            method: "POST",
            body: buildFormData<ITitleActionFormData>({
                action: "update",
                title: newTitle,
            }),
        });

        setFetchingAction(false);
    }

    function onTitleIsValid(details: EditableValueChangeDetails): boolean {
        const {value: newTitle} = details;
        const {success} = v.safeParse(UX_TITLE_SCHEMA, newTitle);

        return success;
    }

    return (
        <AppShell.Container>
            <AppShell.EditableTitle
                disabled={fetchingAction}
                title={title}
                maxLength={32}
                onTitleCommit={onTitleCommit}
                onTitleIsValid={onTitleIsValid}
            />

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
