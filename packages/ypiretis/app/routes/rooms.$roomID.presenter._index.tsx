import type {ButtonProps, EditableValueChangeDetails} from "@chakra-ui/react";
import {
    Box,
    Button,
    Card,
    Grid,
    GridItem,
    HStack,
    IconButton,
    SimpleGrid,
    Span,
    PinInput,
    VStack,
    Tag,
} from "@chakra-ui/react";

import type {MouseEvent, PropsWithChildren} from "react";
import {useState} from "react";

import * as v from "valibot";

import type {IRoomStates} from "~/.server/services/room_service";

import CopyIcon from "~/components/icons/copy_icon";
import ExternalLinkIcon from "~/components/icons/external_link_icon";
import LinkIcon from "~/components/icons/link_icon";
import LockIcon from "~/components/icons/lock_icon";
import LockOpenIcon from "~/components/icons/lock_open_icon";
import NotificationIcon from "~/components/icons/notification_icon";
import PinIcon from "~/components/icons/pin_icon";
import ReloadIcon from "~/components/icons/reload_icon";
import ShieldIcon from "~/components/icons/shield_icon";
import TeachIcon from "~/components/icons/teach_icon";
import UserIcon from "~/components/icons/user_icon";
import UsersIcon from "~/components/icons/users_icon";

import AppShell from "~/components/shell/app_shell";

import {usePresenterContext} from "~/state/presenter";
import {useAuthenticatedSessionContext} from "~/state/session";

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

interface IAttendeeListItemProps {
    readonly isPresenter?: boolean;

    readonly user: {
        readonly accountID: string;

        readonly firstName: string;

        readonly lastName: string;
    };
}

function AttendeeListItem(props: IAttendeeListItemProps) {
    const {isPresenter, user} = props;
    const {accountID, firstName, lastName} = user;

    return (
        <HStack gap="2" bg="bg" padding="3" fontSize="xs">
            {isPresenter ? (
                <TeachIcon fontSize="2xl" />
            ) : (
                <UserIcon fontSize="2xl" />
            )}

            <VStack gap="0" alignItems="flex-start" lineHeight="shorter">
                <HStack>
                    {firstName} {lastName}
                    <Tag.Root
                        variant="solid"
                        colorPalette={isPresenter ? "orange" : "cyan"}
                        size="sm"
                    >
                        <Tag.Label>
                            {isPresenter ? "Presenter" : "Attendee"}
                        </Tag.Label>
                    </Tag.Root>
                </HStack>

                <Span color="fg.muted">{accountID}</Span>
            </VStack>
        </HStack>
    );
}

function AttendeesCard() {
    const {attendees} = usePresenterContext();
    const session = useAuthenticatedSessionContext();

    return (
        <>
            <Card.Body gap="4" maxBlockSize="full" overflow="hidden">
                <Card.Title
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                >
                    Attendees
                    <UsersIcon />
                </Card.Title>

                <VStack
                    alignItems="stretch"
                    gap="2"
                    bg="bg.muted"
                    flexGrow="1"
                    padding="3"
                    maxBlockSize="full"
                    overflowInline="hidden"
                    overflowBlock="auto"
                >
                    <AttendeeListItem user={session} isPresenter />

                    {attendees.map((attendee) => (
                        <AttendeeListItem
                            key={attendee.accountID}
                            user={attendee}
                        />
                    ))}
                </VStack>
            </Card.Body>
        </>
    );
}

function PINCard() {
    const {pin, state} = usePresenterContext();

    const [fetchingAction, setFetchingAction] = useState<boolean>(false);

    const isDisposed = state === "STATE_DISPOSED";
    const canFetchAction = !(isDisposed || fetchingAction);

    async function onCopyClick(
        _event: MouseEvent<HTMLButtonElement, globalThis.MouseEvent>,
    ): Promise<void> {
        await navigator.clipboard.writeText(pin);
    }

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
                    disabled={!canFetchAction}
                    hideBelow="lg"
                    size={{base: "md", lgDown: "sm"}}
                    colorPalette="red"
                    onClick={(event) => onRegenerateClick(event)}
                >
                    New PIN
                    <ReloadIcon />
                </Button>

                <IconButton
                    disabled={isDisposed}
                    hideFrom="lg"
                    size={{base: "md", lgDown: "sm"}}
                    colorPalette="red"
                    onClick={(event) => onRegenerateClick(event)}
                >
                    <ReloadIcon />
                </IconButton>

                <Button
                    disabled={isDisposed}
                    size={{base: "md", lgDown: "sm"}}
                    colorPalette="cyan"
                    flexGrow="1"
                    asChild
                >
                    <a href={`/rooms/${roomID}/qrcode`} target="_blank">
                        QR Code
                        <ExternalLinkIcon />
                    </a>
                </Button>

                <Button
                    disabled={isDisposed}
                    hideBelow="xl"
                    colorPalette="blue"
                    asChild
                >
                    <a href={`/r/${pin}`} target="_blank">
                        Join
                        <LinkIcon />
                    </a>
                </Button>

                <IconButton
                    disabled={isDisposed}
                    hideFrom="xl"
                    size={{base: "md", lgDown: "sm"}}
                    colorPalette="blue"
                    asChild
                >
                    <a href={`/r/${pin}`} target="_blank">
                        <LinkIcon />
                    </a>
                </IconButton>

                <Button
                    disabled={isDisposed}
                    hideBelow="xl"
                    colorPalette="green"
                    onClick={onCopyClick}
                >
                    Copy
                    <CopyIcon />
                </Button>

                <IconButton
                    disabled={isDisposed}
                    hideFrom="xl"
                    size={{base: "md", lgDown: "sm"}}
                    colorPalette="green"
                    onClick={onCopyClick}
                >
                    <CopyIcon />
                </IconButton>
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

    const isDisposed = state === "STATE_DISPOSED";
    const canFetchAction = !(isDisposed || fetchingAction);

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
                        disabled={!canFetchAction}
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
                        disabled={!canFetchAction}
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
                        disabled={!canFetchAction}
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
    const {state, title} = usePresenterContext();

    const [fetchingAction, setFetchingAction] = useState<boolean>(false);

    const isDisposed = state === "STATE_DISPOSED";
    const canFetchAction = !(isDisposed || fetchingAction);

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
            {isDisposed ? (
                <AppShell.Title title={title} />
            ) : (
                <AppShell.EditableTitle
                    disabled={!canFetchAction}
                    title={title}
                    maxLength={32}
                    onTitleCommit={onTitleCommit}
                    onTitleIsValid={onTitleIsValid}
                />
            )}

            <Grid
                templateRows="auto 1fr"
                templateColumns="1fr 1fr"
                columnGap="8"
                rowGap="4"
                flexGrow="1"
                maxBlockSize="full"
                overflow="hidden"
            >
                <Card.Root>
                    <PINCard />
                </Card.Root>

                <Card.Root>
                    <StateCard />
                </Card.Root>

                <GridItem
                    colSpan={2}
                    display="flex"
                    maxBlockSize="full"
                    overflow="hidden"
                >
                    <Card.Root flexGrow="1">
                        <AttendeesCard />
                    </Card.Root>
                </GridItem>
            </Grid>
        </AppShell.Container>
    );
}
