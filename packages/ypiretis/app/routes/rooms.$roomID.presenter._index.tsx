import type {
    ButtonProps,
    EditableValueChangeDetails,
    SegmentGroupValueChangeDetails,
} from "@chakra-ui/react";
import {
    Box,
    Button,
    Card,
    Grid,
    GridItem,
    HStack,
    IconButton,
    Menu,
    Portal,
    SegmentGroup,
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
import MoreVerticalIcon from "~/components/icons/more_vertical_icon";
import NotificationIcon from "~/components/icons/notification_icon";
import PinIcon from "~/components/icons/pin_icon";
import ReloadIcon from "~/components/icons/reload_icon";
import ShieldIcon from "~/components/icons/shield_icon";
import TeachIcon from "~/components/icons/teach_icon";
import UserIcon from "~/components/icons/user_icon";
import UserPlusIcon from "~/components/icons/user_plus_icon";
import UserXIcon from "~/components/icons/user_x_icon";
import UsersIcon from "~/components/icons/users_icon";

import AppShell from "~/components/shell/app_shell";

import type {IAttendee} from "~/state/presenter";
import {usePresenterContext} from "~/state/presenter";
import type {ISession} from "~/state/session";
import {useAuthenticatedSessionContext} from "~/state/session";

import {buildFormData} from "~/utils/forms";
import {title} from "~/utils/valibot";

import type {IActionFormData as IAttendeeActionFormData} from "./rooms_.$roomID_.presenter_.actions_.attendees_.$entityID";
import type {IActionFormData as IRoomActionFormData} from "./rooms_.$roomID_.presenter_.actions_.room";

import {Route} from "./+types/rooms.$roomID.presenter._index";

const UX_TITLE_SCHEMA = v.pipe(
    v.string(),
    v.minLength(1),
    v.maxLength(32),
    title,
);

interface IAttendeeListItemActionsProps {
    readonly user: IAttendee | ISession;
}

interface IAttendeeListItemProps {
    readonly user: IAttendee | ISession;
}

interface IAttendeeListProps {
    readonly users: (IAttendee | ISession)[];
}

function matchUserIcon(user: IAttendee | ISession) {
    const isAttendee = "state" in user;

    if (isAttendee) {
        switch (user.state) {
            case "STATE_AWAITING":
                return UserPlusIcon;

            case "STATE_CONNECTED":
                return UserIcon;

            case "STATE_DISPOSED":
                return UserXIcon;
        }
    }

    return TeachIcon;
}

function matchUserTagPalette(user: IAttendee | ISession) {
    const isAttendee = "state" in user;

    if (isAttendee) {
        switch (user.state) {
            case "STATE_AWAITING":
                return "yellow";

            case "STATE_CONNECTED":
                return "cyan";

            case "STATE_DISPOSED":
                return "red";
        }
    }

    return "orange";
}

function matchUserTagText(user: IAttendee | ISession): string {
    const isAttendee = "state" in user;

    if (isAttendee) {
        switch (user.state) {
            case "STATE_AWAITING":
                return "Awaiting Approval";

            case "STATE_CONNECTED":
                return "Attendee";

            case "STATE_DISPOSED":
                return "Disconnected";
        }
    }

    return "Presenter";
}

function sortUsers(
    attendeeA: IAttendee | ISession,
    attendeeB: IAttendee | ISession,
): number {
    const fullNameA = `${attendeeA.firstName} ${attendeeA.lastName}`;
    const fullNameB = `${attendeeB.firstName} ${attendeeB.lastName}`;

    return fullNameA >= fullNameB ? 1 : 0;
}

function getUsers(
    modeValue: "active" | "pending" | null,
): (IAttendee | ISession)[] {
    const {room} = usePresenterContext();
    const {attendees} = room;

    switch (modeValue) {
        case "pending": {
            return attendees
                .filter((attendee) => {
                    const {state} = attendee;

                    return state === "STATE_AWAITING";
                })
                .sort(sortUsers);
        }
    }

    const session = useAuthenticatedSessionContext();

    const connectedAttendees: IAttendee[] = [];
    const disconnectedAttendees: IAttendee[] = [];

    for (const attendee of attendees) {
        switch (attendee.state) {
            case "STATE_CONNECTED":
                connectedAttendees.push(attendee);
                break;

            case "STATE_DISPOSED":
                disconnectedAttendees.push(attendee);
                break;
        }
    }

    connectedAttendees.sort(sortUsers);
    disconnectedAttendees.sort(sortUsers);

    return [session, ...connectedAttendees, ...disconnectedAttendees];
}

function AttendeeListItemActions(props: IAttendeeListItemActionsProps) {
    const {user} = props;

    const isAttendee = "state" in user;

    if (!isAttendee) {
        return <></>;
    }

    const {room} = usePresenterContext();
    const {state: roomState} = room;

    const {entityID, state: userState} = user;
    const [fetchingAction, setFetchingAction] = useState<boolean>(false);

    const isDisposed = roomState === "STATE_DISPOSED";
    const canFetchAction = !(isDisposed || fetchingAction);

    function makeActionEventHandler(
        action: IAttendeeActionFormData["action"],
    ): (
        event: MouseEvent<HTMLDivElement, globalThis.MouseEvent>,
    ) => Promise<void> {
        return async (_event) => {
            setFetchingAction(true);

            await fetch(`./presenter/actions/attendees/${entityID}`, {
                method: "POST",
                body: buildFormData<IAttendeeActionFormData>({
                    action,
                }),
            });

            setFetchingAction(false);
        };
    }

    const onApproveClick = makeActionEventHandler("moderate.approve");
    const onBanClick = makeActionEventHandler("moderate.ban");
    const onKickClick = makeActionEventHandler("moderate.kick");
    const onRejectClick = makeActionEventHandler("moderate.reject");

    switch (userState) {
        case "STATE_AWAITING":
            return (
                <Menu.Root>
                    <Menu.Trigger asChild>
                        <IconButton
                            variant="ghost"
                            size="xs"
                            marginInlineStart="auto"
                        >
                            <MoreVerticalIcon />
                        </IconButton>
                    </Menu.Trigger>

                    <Portal>
                        <Menu.Positioner>
                            <Menu.Content>
                                <Menu.Item
                                    disabled={!canFetchAction}
                                    value="approve-join"
                                    color="fg.success"
                                    _hover={{
                                        bg: "bg.success",
                                        color: "fg.success",
                                    }}
                                    onClick={onApproveClick}
                                >
                                    Approve Join
                                </Menu.Item>

                                <Menu.Item
                                    disabled={!canFetchAction}
                                    value="reject-join"
                                    color="fg.error"
                                    _hover={{bg: "bg.error", color: "fg.error"}}
                                    onClick={onRejectClick}
                                >
                                    Reject Join
                                </Menu.Item>
                            </Menu.Content>
                        </Menu.Positioner>
                    </Portal>
                </Menu.Root>
            );

        case "STATE_CONNECTED":
            return (
                <Menu.Root>
                    <Menu.Trigger asChild>
                        <IconButton
                            variant="ghost"
                            size="xs"
                            marginInlineStart="auto"
                        >
                            <MoreVerticalIcon />
                        </IconButton>
                    </Menu.Trigger>

                    <Menu.Positioner>
                        <Menu.Content>
                            <Menu.Item
                                disabled={!canFetchAction}
                                value="kick-attendee"
                                color="fg.error"
                                _hover={{bg: "bg.error", color: "fg.error"}}
                                onClick={onKickClick}
                            >
                                Kick Attendee
                            </Menu.Item>

                            <Menu.Item
                                disabled={!canFetchAction}
                                value="ban-attendee"
                                color="fg.error"
                                _hover={{bg: "bg.error", color: "fg.error"}}
                                onClick={onBanClick}
                            >
                                Ban Attendee
                            </Menu.Item>
                        </Menu.Content>
                    </Menu.Positioner>
                </Menu.Root>
            );
    }
}

function AttendeeListItem(props: IAttendeeListItemProps) {
    const {user} = props;
    const {accountID, firstName, lastName} = user;

    const UserIcon = matchUserIcon(user);
    const userTagPalette = matchUserTagPalette(user);
    const userTagText = matchUserTagText(user);

    return (
        <HStack gap="2" bg="bg" padding="3" fontSize="xs">
            <UserIcon fontSize="2xl" />

            <VStack gap="0" alignItems="flex-start" lineHeight="shorter">
                <HStack>
                    {firstName} {lastName}
                    <Tag.Root
                        variant="solid"
                        colorPalette={userTagPalette}
                        size="sm"
                    >
                        <Tag.Label>{userTagText}</Tag.Label>
                    </Tag.Root>
                </HStack>

                <Span color="fg.muted">{accountID}</Span>
            </VStack>

            <AttendeeListItemActions user={user} />
        </HStack>
    );
}

function AttendeeList(props: IAttendeeListProps) {
    const {users} = props;

    // **TODO:** use a virtualized list implementation here

    return users.map((user) => (
        <AttendeeListItem
            key={`${"state" in user ? "attendee" : "presenter"}-${user.accountID}`}
            user={user}
        />
    ));
}

function AttendeesCard() {
    const [modeValue, setModeValue] = useState<"active" | "pending" | null>(
        "active",
    );

    const users = getUsers(modeValue);

    function onModeValueChange(event: SegmentGroupValueChangeDetails): void {
        const {value} = event;

        setModeValue(value as "active" | "pending" | null);
    }

    return (
        <>
            <Card.Body gap="4" maxBlockSize="full" overflow="hidden">
                <Card.Title display="flex" gap="2" alignItems="center">
                    Attendees
                    <SegmentGroup.Root
                        value={modeValue}
                        size="sm"
                        marginInlineStart="auto"
                        fontWeight="normal"
                        onValueChange={onModeValueChange}
                    >
                        <SegmentGroup.Indicator bg="bg" />

                        <SegmentGroup.Item value="active">
                            <SegmentGroup.ItemText
                                color={
                                    modeValue === "active"
                                        ? "green.fg"
                                        : undefined
                                }
                            >
                                Active
                            </SegmentGroup.ItemText>
                            <SegmentGroup.ItemHiddenInput />
                        </SegmentGroup.Item>

                        <SegmentGroup.Item value="pending">
                            <SegmentGroup.ItemText
                                color={
                                    modeValue === "pending"
                                        ? "yellow.fg"
                                        : undefined
                                }
                            >
                                Pending
                            </SegmentGroup.ItemText>
                            <SegmentGroup.ItemHiddenInput />
                        </SegmentGroup.Item>
                    </SegmentGroup.Root>
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
                    <AttendeeList users={users} />
                </VStack>
            </Card.Body>
        </>
    );
}

function PINCard() {
    const {room} = usePresenterContext();
    const {pin, roomID, state} = room;

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

        await fetch("./presenter/actions/room", {
            method: "POST",
            body: buildFormData<IRoomActionFormData>({
                action: "pin.regenerate",
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
    const {room} = usePresenterContext();
    const {state} = room;

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

        await fetch("./presenter/actions/room", {
            method: "POST",
            body: buildFormData<IRoomActionFormData>({
                action: "state.update",
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
    const {room} = usePresenterContext();
    const {state, title} = room;

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

        await fetch("./presenter/actions/room", {
            method: "POST",
            body: buildFormData<IRoomActionFormData>({
                action: "title.update",
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
