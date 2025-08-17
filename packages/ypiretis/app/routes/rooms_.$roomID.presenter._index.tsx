import type {
    EditableValueChangeDetails,
    RadioCardValueChangeDetails,
} from "@chakra-ui/react";
import {
    Box,
    Button,
    HStack,
    IconButton,
    Menu,
    Portal,
    Spacer,
    PinInput,
    Code,
} from "@chakra-ui/react";

import type {MouseEvent, MouseEventHandler, ReactElement} from "react";
import {useCallback, useMemo} from "react";

import * as v from "valibot";

import type {
    IRoomStates,
    ATTENDEE_USER_STATES,
} from "~/.server/services/rooms_service";

import Layout from "~/components/controlpanel/layout";
import ListTile from "~/components/controlpanel/list_tile";
import RadioCardGroup from "~/components/controlpanel/radio_card_group";
import ScrollableListArea from "~/components/controlpanel/scrollable_list_area";
import SectionCard from "~/components/controlpanel/section_card";
import TabbedDataSectionCard from "~/components/controlpanel/tabbed_data_section_card";
import Title from "~/components/controlpanel/title";
import {TOAST_STATUS, useToastsContext} from "~/components/controlpanel/toasts";

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

import {useAsyncCallback} from "~/hooks/async_callback";

import type {IAttendee, IDisconnectedAttendee} from "~/state/presenter";
import {usePresenterContext} from "~/state/presenter";
import type {IPublicUser} from "~/state/public_user";
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

type IUserLike = IAttendee | IDisconnectedAttendee | IPublicUser;

interface IAttendeeListItemConnectedActionsProps {
    readonly user: IAttendee;
}

interface IAttendeeListItemAwaitingActionsProps {
    readonly user: IAttendee;
}

interface IAttendeeListItemGenericActionsProps {
    readonly user: IUserLike;
}

interface IAttendeeListItemActionsProps {
    readonly user: IUserLike;
}

interface IAttendeeListItemProps {
    readonly user: IUserLike;
}

interface IAttendeeListProps {
    readonly users: IUserLike[];
}

function isAttendee(value: unknown): value is IAttendee {
    return (
        value !== null &&
        typeof value === "object" &&
        "state" in value &&
        (value.state === "STATE_CONNECTED" || value.state === "STATE_AWAITING")
    );
}

function isDisconnectedAttendee(
    value: unknown,
): value is IDisconnectedAttendee {
    return (
        value !== null &&
        typeof value === "object" &&
        "state" in value &&
        value.state === "STATE_DISPOSED"
    );
}

function matchUserIcon(user: IUserLike) {
    if (isAttendee(user) || isDisconnectedAttendee(user)) {
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

function matchUserTagPalette(user: IUserLike) {
    if (isAttendee(user) || isDisconnectedAttendee(user)) {
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

function matchUserTagText(user: IUserLike): string {
    if (isAttendee(user) || isDisconnectedAttendee(user)) {
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

function sortUsers(attendeeA: IUserLike, attendeeB: IUserLike): number {
    const fullNameA = `${attendeeA.firstName} ${attendeeA.lastName}`;
    const fullNameB = `${attendeeB.firstName} ${attendeeB.lastName}`;

    return fullNameA >= fullNameB ? 1 : 0;
}

function AttendeeListItemConnectedActions(
    props: IAttendeeListItemConnectedActionsProps,
) {
    const {user} = props;
    const {entityID, isRaisingHand} = user;

    const {room} = usePresenterContext();
    const {state} = room;

    const [isFetchingAction, onAttendeeAction] = useAsyncCallback(
        async (
            _event: MouseEvent,
            action: IAttendeeActionFormData["action"],
        ) => {
            await fetch(`./presenter/actions/attendees/${entityID}`, {
                method: "POST",

                body: buildFormData<IAttendeeActionFormData>({
                    action,
                }),
            });
        },

        [entityID],
    );

    const isDisposed = state === "STATE_DISPOSED";
    const isActionDisabled = isDisposed || isFetchingAction;

    const onBanClick = useCallback(
        (async (_event: MouseEvent) => {
            await onAttendeeAction(_event, "moderate.ban");
        }) satisfies MouseEventHandler<HTMLButtonElement>,

        [onAttendeeAction],
    );

    const onDismissHandClick = useCallback(
        (async (_event: MouseEvent) => {
            await onAttendeeAction(_event, "participation.dismissHand");
        }) satisfies MouseEventHandler<HTMLButtonElement>,

        [onAttendeeAction],
    );

    const onKickClick = useCallback(
        (async (_event: MouseEvent) => {
            await onAttendeeAction(_event, "moderate.kick");
        }) satisfies MouseEventHandler<HTMLButtonElement>,

        [onAttendeeAction],
    );

    return (
        <>
            <Menu.Item
                key="dismiss-hand"
                disabled={isActionDisabled || !isRaisingHand}
                value="dismiss-hand"
                onClick={onDismissHandClick}
            >
                <HumanHandsdownIcon />

                <Box flexGrow="1">Dismiss Hand</Box>
            </Menu.Item>

            <Menu.Separator />

            <Menu.Item
                key="kick-attendee"
                disabled={isActionDisabled}
                value="kick-attendee"
                color="fg.error"
                _hover={{bg: "bg.error", color: "fg.error"}}
                onClick={onKickClick}
            >
                <UserXIcon />

                <Box flexGrow="1">Kick Attendee</Box>
            </Menu.Item>

            <Menu.Item
                key="ban-attendee"
                disabled={isActionDisabled}
                value="ban-attendee"
                color="fg.error"
                _hover={{bg: "bg.error", color: "fg.error"}}
                onClick={onBanClick}
            >
                <ShieldIcon />

                <Box flexGrow="1">Ban Attendee</Box>
            </Menu.Item>
        </>
    );
}

function AttendeeListItemAwaitingActions(
    props: IAttendeeListItemAwaitingActionsProps,
) {
    const {user} = props;
    const {entityID} = user;

    const {room} = usePresenterContext();
    const {state} = room;

    const [isFetchingAction, onAttendeeAction] = useAsyncCallback(
        async (
            _event: MouseEvent,
            action: IAttendeeActionFormData["action"],
        ) => {
            await fetch(`./presenter/actions/attendees/${entityID}`, {
                method: "POST",

                body: buildFormData<IAttendeeActionFormData>({
                    action,
                }),
            });
        },

        [entityID],
    );

    const isDisposed = state === "STATE_DISPOSED";
    const isActionDisabled = isDisposed || isFetchingAction;

    const onApproveClick = useCallback(
        (async (_event: MouseEvent) => {
            await onAttendeeAction(_event, "moderate.approve");
        }) satisfies MouseEventHandler<HTMLButtonElement>,

        [onAttendeeAction],
    );

    const onRejectClick = useCallback(
        (async (_event: MouseEvent) => {
            await onAttendeeAction(_event, "moderate.reject");
        }) satisfies MouseEventHandler<HTMLButtonElement>,

        [onAttendeeAction],
    );

    return (
        <>
            <Menu.Item
                key="approve-join"
                disabled={isActionDisabled}
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
            </Menu.Item>

            <Menu.Item
                key="reject-join"
                disabled={isActionDisabled}
                value="reject-join"
                color="fg.error"
                _hover={{bg: "bg.error", color: "fg.error"}}
                onClick={onRejectClick}
            >
                <CloseIcon />

                <Box flexGrow="1">Reject Join</Box>
            </Menu.Item>
        </>
    );
}

function AttendeeListItemGenericActions(
    props: IAttendeeListItemGenericActionsProps,
) {
    const {user} = props;
    const {accountID} = user;

    const accountEmailAddress = `${accountID}@${ACCOUNT_PROVIDER_DOMAIN}`;

    return (
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
        </Menu.Root>
    );
}

function AttendeeListItemActions(props: IAttendeeListItemActionsProps) {
    const {user} = props;

    if (!isAttendee(user)) {
        return <></>;
    }

    return (
        <Menu.Root>
            <Menu.Trigger asChild>
                <ListTile.IconButton variant="ghost">
                    <MoreVerticalIcon />
                </ListTile.IconButton>
            </Menu.Trigger>

            <Portal>
                <Menu.Positioner>
                    <Menu.Content>
                        <AttendeeListItemGenericActions user={user} />

                        {user.state === "STATE_AWAITING" ? (
                            <>
                                <Menu.Separator />
                                <AttendeeListItemAwaitingActions user={user} />
                            </>
                        ) : (
                            <></>
                        )}

                        {user.state === "STATE_CONNECTED" ? (
                            <>
                                <Menu.Separator />
                                <AttendeeListItemConnectedActions user={user} />
                            </>
                        ) : (
                            <></>
                        )}
                    </Menu.Content>
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
        <ListTile.Root>
            <ListTile.Icon>
                <UserIcon />
            </ListTile.Icon>

            <ListTile.Header>
                <ListTile.Title>
                    {firstName} {lastName}
                    <ListTile.Tag colorPalette={userTagPalette}>
                        {userTagText}
                    </ListTile.Tag>
                </ListTile.Title>

                <ListTile.Description>{accountID}</ListTile.Description>
            </ListTile.Header>

            <ListTile.Footer>
                <AttendeeListItemActions user={user} />
            </ListTile.Footer>
        </ListTile.Root>
    );
}

function AttendeeList(props: IAttendeeListProps) {
    const {users} = props;

    return (
        <ScrollableListArea flexGrow="1">
            {users.map((user) => (
                <AttendeeListItem
                    key={`${isAttendee(user) ? "attendee" : "presenter"}-${user.accountID}`}
                    user={user}
                />
            ))}
        </ScrollableListArea>
    );
}

function AttendeesCardActions() {
    const {room} = usePresenterContext();

    const {attendees, disconnectedAttendees} = room;

    const accountEmailAddresses = [...attendees, ...disconnectedAttendees]
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

    const {disconnectedAttendees} = room;

    const users = useMemo(() => {
        return disconnectedAttendees.toSorted(sortUsers) satisfies IUserLike[];
    }, [disconnectedAttendees]);

    const onProvideUsers = useCallback(
        (() => {
            return users;
        }) satisfies () => IUserLike[],

        [users],
    );

    return (
        <TabbedDataSectionCard.Tab
            id="disconnected-users"
            label={`Disconnected (${users.length})`}
            provider={onProvideUsers}
        />
    );
}

function AttendeesCardPendingTab() {
    const {room} = usePresenterContext();

    const {attendees} = room;

    const users = useMemo(() => {
        return attendees
            .filter((attendee) => {
                const {state} = attendee;

                return state === "STATE_AWAITING";
            })
            .sort(sortUsers) satisfies IUserLike[];
    }, [attendees]);

    const onProvideUsers = useCallback(
        (() => {
            return users;
        }) satisfies () => IUserLike[],

        [users],
    );

    return (
        <TabbedDataSectionCard.Tab
            id="pending-users"
            label={`Pending (${users.length})`}
            provider={onProvideUsers}
        />
    );
}

function AttendeesCardActiveTab() {
    const session = useAuthenticatedPublicUserContext();
    const {room} = usePresenterContext();

    const {attendees} = room;

    const users = useMemo(() => {
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

        return [
            session,
            ...loweredHandAttendees,
            ...raisedHandAttendees,
        ] satisfies IUserLike[];
    }, [attendees, session]);

    const onProvideUsers = useCallback(
        (() => {
            return users;
        }) satisfies () => IUserLike[],

        [users],
    );

    return (
        <TabbedDataSectionCard.Tab
            id="active-users"
            label={`Active (${users.length})`}
            provider={onProvideUsers}
        />
    );
}

function AttendeesCard() {
    return (
        <TabbedDataSectionCard.Root
            flexGrow="1"
            maxBlockSize="full"
            overflow="hidden"
        >
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
                    {(users: IUserLike[]) => <AttendeeList users={users} />}
                </TabbedDataSectionCard.View>
            </TabbedDataSectionCard.Body>

            <TabbedDataSectionCard.Footer justifyContent="flex-end">
                <AttendeesCardActions />
            </TabbedDataSectionCard.Footer>
        </TabbedDataSectionCard.Root>
    );
}

function StateCard() {
    const {room} = usePresenterContext();
    const {displayToast} = useToastsContext();

    const {state} = room;

    const [isFetchingAction, onStateChange] = useAsyncCallback(
        (async (details) => {
            const {value} = details as {
                value: Exclude<IRoomStates, "STATE_DISPOSED">;
            };

            await fetch("./presenter/actions/room", {
                method: "POST",

                body: buildFormData<IRoomActionFormData>({
                    action: "state.update",
                    state: value,
                }),
            });

            let stateText: string;

            switch (value) {
                case "STATE_LOCKED":
                    stateText = "locked";
                    break;

                case "STATE_PERMISSIVE":
                    stateText = "permission only";
                    break;

                case "STATE_UNLOCKED":
                    stateText = "unlocked";
                    break;
            }

            displayToast({
                status: TOAST_STATUS.success,
                title: <>Updated the room's state to be {stateText}</>,
            });
        }) satisfies (details: RadioCardValueChangeDetails) => Promise<void>,

        [displayToast],
    );

    const isDisposed = state === "STATE_DISPOSED";
    const isActionDisabled = isDisposed || isFetchingAction;

    return (
        <SectionCard.Root flexGrow="1">
            <SectionCard.Body>
                <SectionCard.Title>
                    Room State
                    <Spacer />
                    <ShieldIcon />
                </SectionCard.Title>

                <RadioCardGroup.Root
                    disabled={isActionDisabled}
                    value={state}
                    flexGrow="1"
                    fontSize="xl"
                    onValueChange={onStateChange}
                >
                    <RadioCardGroup.Option
                        value={
                            "STATE_LOCKED" satisfies Exclude<
                                IRoomStates,
                                "STATE_DISPOSED"
                            >
                        }
                        label="Locked"
                        icon={<LockIcon width="1.5em" height="1.5em" />}
                        colorPalette="red"
                        fontSize="inherit"
                    />

                    <RadioCardGroup.Option
                        value={
                            "STATE_UNLOCKED" satisfies Exclude<
                                IRoomStates,
                                "STATE_DISPOSED"
                            >
                        }
                        label="Unlocked"
                        icon={<LockOpenIcon width="1.5em" height="1.5em" />}
                        colorPalette="green"
                        fontSize="inherit"
                    />

                    <RadioCardGroup.Option
                        value={
                            "STATE_PERMISSIVE" satisfies Exclude<
                                IRoomStates,
                                "STATE_DISPOSED"
                            >
                        }
                        label="Permissive"
                        icon={<NotificationIcon width="1.5em" height="1.5em" />}
                        colorPalette="yellow"
                        fontSize="inherit"
                    />
                </RadioCardGroup.Root>
            </SectionCard.Body>
        </SectionCard.Root>
    );
}

function PINCard() {
    const {room} = usePresenterContext();
    const {displayToast} = useToastsContext();

    const {pin, roomID, state} = room;

    const onCopyClick = useCallback(
        (async (_event) => {
            await navigator.clipboard.writeText(pin);

            displayToast({
                status: TOAST_STATUS.success,
                title: (
                    <>
                        Copied the room's PIN <Code>{pin}</Code> to clipboard
                    </>
                ),
            });
        }) satisfies MouseEventHandler<HTMLButtonElement>,

        [displayToast, pin],
    );

    const [isFetchingAction, onRegenerateClick] = useAsyncCallback(
        (async (_event) => {
            await fetch("./presenter/actions/room", {
                method: "POST",

                body: buildFormData<IRoomActionFormData>({
                    action: "pin.regenerate",
                }),
            });

            displayToast({
                status: TOAST_STATUS.success,
                title: "Regenerated the room's PIN",
            });
        }) satisfies MouseEventHandler<HTMLButtonElement>,

        [displayToast],
    );

    const isDisposed = state === "STATE_DISPOSED";
    const isActionDisabled = isDisposed || isFetchingAction;

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
                    disabled={isActionDisabled}
                    hideBelow="lg"
                    size={{base: "md", lgDown: "sm"}}
                    colorPalette="red"
                    onClick={onRegenerateClick}
                >
                    New PIN
                    <ReloadIcon />
                </Button>

                <IconButton
                    disabled={isActionDisabled}
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

function RoomTitle() {
    const {room} = usePresenterContext();
    const {displayToast} = useToastsContext();

    const {state, title} = room;

    const [isFetchingAction, onTitleChange] = useAsyncCallback(
        (async (details) => {
            const {value: newTitle} = details;

            if (title === newTitle) {
                return;
            }

            await fetch("./presenter/actions/room", {
                method: "POST",
                body: buildFormData<IRoomActionFormData>({
                    action: "title.update",
                    title: newTitle,
                }),
            });

            displayToast({
                status: TOAST_STATUS.success,
                title: `Updated the room's title`,
            });
        }) satisfies (details: EditableValueChangeDetails) => Promise<void>,

        [displayToast],
    );

    const onTitleValidate = useCallback(
        ((details) => {
            const {value: newTitle} = details;
            const {success} = v.safeParse(UX_TITLE_SCHEMA, newTitle);

            return success;
        }) satisfies (details: EditableValueChangeDetails) => boolean,

        [],
    );

    const isDisposed = state === "STATE_DISPOSED";
    const isActionDisabled = isDisposed || isFetchingAction;

    return isDisposed ? (
        <Title.Text title={title} />
    ) : (
        <Title.Editable
            disabled={isActionDisabled}
            title={title}
            maxLength={32}
            onCommit={onTitleChange}
            onValidate={onTitleValidate}
        />
    );
}

export default function RoomsPresenterIndex(_props: Route.ComponentProps) {
    return (
        <Layout.FixedContainer>
            <RoomTitle />

            <HStack gap="inherit" alignItems="stretch">
                <PINCard />
                <StateCard />
            </HStack>

            <AttendeesCard />
        </Layout.FixedContainer>
    );
}
