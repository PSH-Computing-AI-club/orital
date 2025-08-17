import {Spacer, Strong, Text} from "@chakra-ui/react";

import type {MouseEventHandler} from "react";

import type {ShouldRevalidateFunction} from "react-router";
import {Outlet} from "react-router";

import * as v from "valibot";

import {
    ATTENDEE_USER_STATES,
    PRESENTER_USER_STATES,
    requireAuthenticatedPresenterConnection,
} from "~/.server/services/rooms_service";

import {ulid} from "~/.server/utils/valibot";

import Separator from "~/components/common/separator";

import Layout from "~/components/controlpanel/layout";
import Sidebar from "~/components/controlpanel/sidebar";
import Toasts from "~/components/controlpanel/toasts";

import CloseIcon from "~/components/icons/close_icon";
import DashboardIcon from "~/components/icons/dashboard_icon";
import SlidersIcon from "~/components/icons/sliders_icon";

import {validateParams} from "~/guards/validation";

import {useAsyncCallback} from "~/hooks/async_callback";
import {WebSocketCacheProvider} from "~/hooks/web_socket";

import type {
    IAttendee,
    IDisconnectedAttendee,
    IDisplay,
    IInitialPresenterContext,
} from "~/state/presenter";
import {PresenterContextProvider, usePresenterContext} from "~/state/presenter";

import {PublicUserContextProvider, mapPublicUser} from "~/state/public_user";

import {buildFormData} from "~/utils/forms";

import type {IActionFormData} from "./rooms_.$roomID_.presenter_.actions_.room";

import {Route} from "./+types/rooms_.$roomID.presenter";

const LOADER_PARAMS_SCHEMA = v.object({
    roomID: ulid,
});

export const shouldRevalidate = ((_revalidateArgs) => {
    return false;
}) satisfies ShouldRevalidateFunction;

export function clientLoader(loaderArgs: Route.ClientLoaderArgs) {
    return loaderArgs.serverLoader();
}

clientLoader.hydrate = true as const;

export async function loader(loaderArgs: Route.LoaderArgs) {
    const {roomID} = validateParams(LOADER_PARAMS_SCHEMA, loaderArgs);

    const {room, user} = await requireAuthenticatedPresenterConnection(
        loaderArgs,
        roomID,
    );

    const {
        approvedAccountIDs,
        attendees,
        disconnectedAttendees,
        displays,
        pin,
        state,
        title,
    } = room;
    const publicUser = mapPublicUser(user);

    const initialApprovedAccountIDs = Array.from(approvedAccountIDs);

    const initialAttendees = Array.from(attendees.values()).map((attendee) => {
        const {id: entityID, isRaisingHand, state, user} = attendee;
        const {accountID, firstName, lastName} = user;

        return {
            accountID,
            entityID,
            firstName,
            isRaisingHand,
            lastName,
            state,
        };
    }) satisfies IAttendee[];

    const initialDisconnectAttendees = Array.from(
        disconnectedAttendees.values(),
    ).map((disconnectedAttendee) => {
        const {accountID, firstName, lastName} = disconnectedAttendee;

        return {
            accountID,
            firstName,
            lastName,
            state: ATTENDEE_USER_STATES.disposed,
        };
    }) satisfies IDisconnectedAttendee[];

    const initialDisplays = Array.from(displays.values()).map((display) => {
        const {id: entityID, state} = display;

        return {
            entityID,
            state,
        };
    }) satisfies IDisplay[];

    return {
        initialContextData: {
            room: {
                approvedAccountIDs: initialApprovedAccountIDs,
                attendees: initialAttendees,
                disconnectedAttendees: initialDisconnectAttendees,
                displays: initialDisplays,

                pin,
                roomID,
                state,
                title,
            },

            state: PRESENTER_USER_STATES.disposed,
        } satisfies IInitialPresenterContext,

        publicUser,
    };
}

export function HydrateFallback() {
    return (
        <>
            <noscript>
                <Text>
                    JavaScript is <Strong color="red.solid">required</Strong> to
                    use the presenter portal.
                </Text>
            </noscript>

            <Text>Loading...</Text>
        </>
    );
}

function SidebarView() {
    const {room} = usePresenterContext();

    const {roomID, state} = room;

    const [isFetchingAction, onDisposeClick] = useAsyncCallback(
        (async (_event) => {
            await fetch("./presenter/actions/room", {
                method: "POST",
                body: buildFormData<IActionFormData>({
                    action: "state.dispose",
                }),
            });
        }) satisfies MouseEventHandler<HTMLButtonElement>,

        [],
    );

    const isDisposed = state === "STATE_DISPOSED";
    const isActionDisabled = isDisposed || isFetchingAction;

    return (
        <Sidebar.Root>
            <Sidebar.Container>
                <Sidebar.Link to={`/rooms/${roomID}/presenter`}>
                    <Sidebar.Icon>
                        <DashboardIcon />
                    </Sidebar.Icon>
                    Dashboard
                </Sidebar.Link>

                <Spacer />

                <Separator.Horizontal />

                <Sidebar.Link to={`/rooms/${roomID}/presenter/settings`}>
                    <Sidebar.Icon>
                        <SlidersIcon />
                    </Sidebar.Icon>
                    Settings
                </Sidebar.Link>

                <Sidebar.Button
                    disabled={isActionDisabled}
                    colorPalette="red"
                    onClick={onDisposeClick}
                >
                    <Sidebar.Icon>
                        <CloseIcon />
                    </Sidebar.Icon>
                    Close Room
                </Sidebar.Button>
            </Sidebar.Container>
        </Sidebar.Root>
    );
}

export default function RoomsPresenterLayout(props: Route.ComponentProps) {
    const {loaderData} = props;
    const {initialContextData, publicUser} = loaderData;

    return (
        <Toasts.Root>
            <Layout.Root>
                <WebSocketCacheProvider>
                    <PublicUserContextProvider publicUser={publicUser}>
                        <PresenterContextProvider
                            initialContextData={initialContextData}
                        >
                            <SidebarView />

                            <Outlet />
                        </PresenterContextProvider>
                    </PublicUserContextProvider>
                </WebSocketCacheProvider>
            </Layout.Root>

            <Toasts.Container />
        </Toasts.Root>
    );
}
