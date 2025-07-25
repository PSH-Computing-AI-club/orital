import type {ButtonProps, EditableValueChangeDetails} from "@chakra-ui/react";
import {
    Box,
    Button,
    Grid,
    GridItem,
    HStack,
    IconButton,
    Menu,
    Portal,
    SimpleGrid,
    Spacer,
    Span,
    PinInput,
    Tag,
    VStack,
} from "@chakra-ui/react";

import type {MouseEvent, PropsWithChildren, ReactElement} from "react";
import {useState} from "react";

import * as v from "valibot";

import type {IRoomStates} from "~/.server/services/rooms_service";
import type {IPublicUser} from "~/.server/services/users_service";

import Layout from "~/components/controlpanel/layout";
import SectionCard from "~/components/controlpanel/section_card";
import TabbedDataSectionCard from "~/components/controlpanel/tabbed_data_section_card";
import Title from "~/components/controlpanel/title";

import AvatarIcon from "~/components/icons/avatar_icon";
import CheckIcon from "~/components/icons/check_icon";
import ChevronLeftIcon from "~/components/icons/chevron_left_icon";
import ChevronUpIcon from "~/components/icons/chevron_up_icon";
import CloseIcon from "~/components/icons/close_icon";
import CopyIcon from "~/components/icons/copy_icon";
import ExternalLinkIcon from "~/components/icons/external_link_icon";
import HumanHandsdownIcon from "~/components/icons/human_handsdown_icon";
import HumanHandsupIcon from "~/components/icons/human_handsup_icon";
import LinkIcon from "~/components/icons/link_icon";
import LockIcon from "~/components/icons/lock_icon";
import LockOpenIcon from "~/components/icons/lock_open_icon";
import LogoutIcon from "~/components/icons/logout_icon";
import MailIcon from "~/components/icons/mail_icon";
import MoreVerticalIcon from "~/components/icons/more_vertical_icon";
import NotificationIcon from "~/components/icons/notification_icon";
import PinIcon from "~/components/icons/pin_icon";
import ReloadIcon from "~/components/icons/reload_icon";
import ShieldIcon from "~/components/icons/shield_icon";
import TeachIcon from "~/components/icons/teach_icon";
import UserXIcon from "~/components/icons/user_x_icon";
import UsersIcon from "~/components/icons/users_icon";

import type {IAttendee} from "~/state/presenter";
import {usePresenterContext} from "~/state/presenter";
import {useAuthenticatedPublicUserContext} from "~/state/public_user";

import {ACCOUNT_PROVIDER_DOMAIN} from "~/utils/constants";
import {buildFormData} from "~/utils/forms";
import {title} from "~/utils/valibot";

import type {IActionFormData as IAttendeeActionFormData} from "./rooms_.$roomID_.presenter_.actions_.attendees_.$entityID";
import type {IActionFormData as IRoomActionFormData} from "./rooms_.$roomID_.presenter_.actions_.room";

import {Route} from "./+types/rooms_.$roomID.presenter._index";

const UX_TITLE_SCHEMA = v.pipe(
    v.string(),
    v.nonEmpty(),
    v.maxLength(32),
    title,
);

type IUser = IAttendee | IPublicUser;

interface IAttendeeListItemActionsProps {
    readonly user: IUser;
}

interface IAttendeeListItemProps {
    readonly user: IUser;
}

function isAttendee(value: unknown): value is IAttendee {
    return value !== null && typeof value === "object" && "state" in value;
}

function matchUserIcon(user: IUser) {
    if (isAttendee(user)) {
        switch (user.state) {
            case "STATE_AWAITING":
                return NotificationIcon;

            case "STATE_CONNECTED":
                return user.isRaisingHand ? HumanHandsupIcon : AvatarIcon;

            case "STATE_DISPOSED":
                return LogoutIcon;
        }
    }

    return TeachIcon;
}

function matchUserTagPalette(user: IUser) {
    if (isAttendee(user)) {
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

function matchUserTagText(user: IUser): string {
    if (isAttendee(user)) {
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

function sortUsers(attendeeA: IUser, attendeeB: IUser): number {
    const fullNameA = `${attendeeA.firstName} ${attendeeA.lastName}`;
    const fullNameB = `${attendeeB.firstName} ${attendeeB.lastName}`;

    return fullNameA >= fullNameB ? 1 : 0;
}

function AttendeeListItemActions(props: IAttendeeListItemActionsProps) {
    const {user} = props;

    if (!isAttendee(user)) {
        return <></>;
    }

    const {room} = usePresenterContext();
    const {state: roomState} = room;

    const {accountID, entityID, isRaisingHand, state: userState} = user;
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

    const menuItems: ReactElement[] = [];

    const accountEmailAddress = `${accountID}@${ACCOUNT_PROVIDER_DOMAIN}`;

    menuItems.push(
        <Menu.Root
            key="email-user"
            positioning={{placement: "left-start", gutter: 2}}
        >
            <Menu.TriggerItem>
                <ChevronLeftIcon />
                E-Mail Attendee
            </Menu.TriggerItem>

            <Portal>
                <Menu.Positioner>
                    <Menu.Content>
                        <Menu.Item value="via-web-outlook" asChild>
                            <a
                                href={`https://outlook.office.com/mail/deeplink/compose?to=${accountEmailAddress}`}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                via Web Outlook
                            </a>
                        </Menu.Item>

                        <Menu.Item value="via-mail-client" asChild>
                            <a
                                href={`mailto:${accountEmailAddress}`}
                                target="_blank"
                            >
                                via Mail Client
                            </a>
                        </Menu.Item>
                    </Menu.Content>
                </Menu.Positioner>
            </Portal>
        </Menu.Root>,
    );

    switch (userState) {
        case "STATE_AWAITING": {
            const onApproveClick = makeActionEventHandler("moderate.approve");
            const onRejectClick = makeActionEventHandler("moderate.reject");

            menuItems.push(
                <Menu.Separator />,

                <Menu.Item
                    key="approve-join"
                    disabled={!canFetchAction}
                    value="approve-join"
                    color="fg.success"
                    _hover={{
                        bg: "bg.success",
                        color: "fg.success",
                    }}
                    onClick={onApproveClick}
                >
                    <CheckIcon />

                    <Box flexGrow="1">Approve Join</Box>
                </Menu.Item>,

                <Menu.Item
                    key="reject-join"
                    disabled={!canFetchAction}
                    value="reject-join"
                    color="fg.error"
                    _hover={{bg: "bg.error", color: "fg.error"}}
                    onClick={onRejectClick}
                >
                    <CloseIcon />

                    <Box flexGrow="1">Reject Join</Box>
                </Menu.Item>,
            );

            break;
        }

        case "STATE_CONNECTED": {
            const onBanClick = makeActionEventHandler("moderate.ban");
            const onDismissHandClick = makeActionEventHandler(
                "participation.dismissHand",
            );
            const onKickClick = makeActionEventHandler("moderate.kick");

            menuItems.push(
                <Menu.Separator />,

                <Menu.Item
                    key="dismiss-hand"
                    disabled={!canFetchAction || !isRaisingHand}
                    value="dismiss-hand"
                    onClick={onDismissHandClick}
                >
                    <HumanHandsdownIcon />

                    <Box flexGrow="1">Dismiss Hand</Box>
                </Menu.Item>,

                <Menu.Separator />,

                <Menu.Item
                    key="kick-attendee"
                    disabled={!canFetchAction}
                    value="kick-attendee"
                    color="fg.error"
                    _hover={{bg: "bg.error", color: "fg.error"}}
                    onClick={onKickClick}
                >
                    <UserXIcon />

                    <Box flexGrow="1">Kick Attendee</Box>
                </Menu.Item>,

                <Menu.Item
                    key="ban-attendee"
                    disabled={!canFetchAction}
                    value="ban-attendee"
                    color="fg.error"
                    _hover={{bg: "bg.error", color: "fg.error"}}
                    onClick={onBanClick}
                >
                    <ShieldIcon />

                    <Box flexGrow="1">Ban Attendee</Box>
                </Menu.Item>,
            );

            break;
        }
    }

    return (
        <Menu.Root>
            <Spacer />

            <Menu.Trigger asChild>
                <IconButton variant="ghost" size="xs">
                    <MoreVerticalIcon />
                </IconButton>
            </Menu.Trigger>

            <Portal>
                <Menu.Positioner>
                    <Menu.Content>{menuItems}</Menu.Content>
                </Menu.Positioner>
            </Portal>
        </Menu.Root>
    );
}

function AttendeeListItem(props: IAttendeeListItemProps) {
    const {user} = props;
    const {accountID, firstName, lastName} = user;

    const UserIcon = matchUserIcon(user);
    const userTagPalette = matchUserTagPalette(user);
    const userTagText = matchUserTagText(user);

    return (
        <HStack
            gap="2"
            bg="bg"
            padding="3"
            borderColor="border"
            borderStyle="solid"
            borderWidth="thin"
            fontSize="xs"
        >
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

function AttendeesCardActions() {
    const {room} = usePresenterContext();
    const {attendees} = room;

    const accountEmailAddresses = attendees
        .filter((attendee) => {
            const {state} = attendee;

            return state === "STATE_CONNECTED" || state === "STATE_DISPOSED";
        })
        .map((attendee) => {
            const {accountID} = attendee;

            return `${accountID}@${ACCOUNT_PROVIDER_DOMAIN}`;
        })
        .sort((emailA, emailB) => {
            return emailA.toLowerCase() >= emailB.toLowerCase() ? 1 : 0;
        })
        .join(",");

    return (
        <Menu.Root positioning={{placement: "top-end"}}>
            <Menu.Trigger asChild>
                <Button size={{base: "md", lgDown: "sm"}} colorPalette="cyan">
                    <MailIcon />
                    E-Mail Attendees
                    <ChevronUpIcon />
                </Button>
            </Menu.Trigger>

            <Portal>
                <Menu.Positioner>
                    <Menu.Content>
                        <Menu.Item value="via-web-outlook" asChild>
                            <a
                                href={`https://outlook.office.com/mail/deeplink/compose?to=${accountEmailAddresses}`}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                via Web Outlook
                            </a>
                        </Menu.Item>

                        <Menu.Item value="via-mail-client" asChild>
                            <a
                                href={`mailto:${accountEmailAddresses}`}
                                target="_blank"
                            >
                                via Mail Client
                            </a>
                        </Menu.Item>
                    </Menu.Content>
                </Menu.Positioner>
            </Portal>
        </Menu.Root>
    );
}

function AttendeesCardDisconnectedTab() {
    const {room} = usePresenterContext();
    const {attendees} = room;

    const users = attendees
        .filter((attendee) => {
            const {state} = attendee;

            return state === "STATE_DISPOSED";
        })
        .sort(sortUsers);

    return (
        <TabbedDataSectionCard.Tab
            title={`Disconnected (${users.length})`}
            provider={() => users satisfies IUser[]}
        />
    );
}

function AttendeesCardPendingTab() {
    const {room} = usePresenterContext();
    const {attendees} = room;

    const users = attendees
        .filter((attendee) => {
            const {state} = attendee;

            return state === "STATE_AWAITING";
        })
        .sort(sortUsers);

    return (
        <TabbedDataSectionCard.Tab
            title={`Pending (${users.length})`}
            provider={() => users satisfies IUser[]}
        />
    );
}

function AttendeesCardActiveTab() {
    const {room} = usePresenterContext();
    const {attendees} = room;

    const session = useAuthenticatedPublicUserContext();

    const loweredHandAttendees: IAttendee[] = [];
    const raisedHandAttendees: IAttendee[] = [];

    for (const attendee of attendees) {
        if (attendee.state !== "STATE_CONNECTED") {
            continue;
        }

        if (attendee.isRaisingHand) {
            loweredHandAttendees.push(attendee);
        } else {
            raisedHandAttendees.push(attendee);
        }
    }

    loweredHandAttendees.sort(sortUsers);
    raisedHandAttendees.sort(sortUsers);

    const users = [session, ...loweredHandAttendees, ...raisedHandAttendees];

    return (
        <TabbedDataSectionCard.Tab
            title={`Active (${users.length})`}
            provider={() => users satisfies IUser[]}
        />
    );
}

function AttendeesCard() {
    return (
        <GridItem colSpan={2} maxBlockSize="full" overflow="hidden" asChild>
            <TabbedDataSectionCard.Root>
                <TabbedDataSectionCard.Body>
                    <TabbedDataSectionCard.Title>
                        Attendees
                        <Spacer />
                        <TabbedDataSectionCard.Tabs />
                        <UsersIcon />
                    </TabbedDataSectionCard.Title>

                    <AttendeesCardActiveTab />
                    <AttendeesCardPendingTab />
                    <AttendeesCardDisconnectedTab />

                    <TabbedDataSectionCard.View>
                        {(users: IUser[]) => {
                            return (
                                <TabbedDataSectionCard.Scrollable>
                                    {users.map((user) => (
                                        <AttendeeListItem
                                            key={`${isAttendee(user) ? "attendee" : "presenter"}-${user.accountID}`}
                                            user={user}
                                        />
                                    ))}
                                </TabbedDataSectionCard.Scrollable>
                            );
                        }}
                    </TabbedDataSectionCard.View>
                </TabbedDataSectionCard.Body>

                <TabbedDataSectionCard.Footer justifyContent="flex-end">
                    <AttendeesCardActions />
                </TabbedDataSectionCard.Footer>
            </TabbedDataSectionCard.Root>
        </GridItem>
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
        <SectionCard.Root>
            <SectionCard.Body>
                <SectionCard.Title>
                    Room PIN
                    <Spacer />
                    <PinIcon />
                </SectionCard.Title>

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
            </SectionCard.Body>

            <SectionCard.Footer>
                <Button
                    disabled={!canFetchAction}
                    hideBelow="lg"
                    size={{base: "md", lgDown: "sm"}}
                    colorPalette="red"
                    onClick={onRegenerateClick}
                >
                    New PIN
                    <ReloadIcon />
                </Button>

                <IconButton
                    disabled={isDisposed}
                    hideFrom="lg"
                    size={{base: "md", lgDown: "sm"}}
                    colorPalette="red"
                    onClick={onRegenerateClick}
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
            </SectionCard.Footer>
        </SectionCard.Root>
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

    function makeStateActionEventHandler(
        newState: Exclude<IRoomStates, "STATE_DISPOSED">,
    ): (
        event: MouseEvent<HTMLButtonElement, globalThis.MouseEvent>,
    ) => Promise<void> {
        return async (_event) => {
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
        };
    }

    const onLockedStateClick = makeStateActionEventHandler("STATE_LOCKED");
    const onUnlockedStateClick = makeStateActionEventHandler("STATE_UNLOCKED");
    const onPermissiveStateClick =
        makeStateActionEventHandler("STATE_PERMISSIVE");

    return (
        <SectionCard.Root>
            <SectionCard.Body>
                <SectionCard.Title>
                    Room State
                    <Spacer />
                    <ShieldIcon />
                </SectionCard.Title>

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
                        onClick={onLockedStateClick}
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
                        onClick={onUnlockedStateClick}
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
                        onClick={onPermissiveStateClick}
                    >
                        <StateCardIcon>
                            <NotificationIcon />
                        </StateCardIcon>
                        Permissive
                    </StateCardButton>
                </SimpleGrid>
            </SectionCard.Body>
        </SectionCard.Root>
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
        <Layout.FixedContainer>
            {isDisposed ? (
                <Title.Text title={title} />
            ) : (
                <Title.Editable
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
                <PINCard />
                <StateCard />

                <AttendeesCard />
            </Grid>
        </Layout.FixedContainer>
    );
}
