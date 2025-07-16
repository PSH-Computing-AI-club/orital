import {Spacer, Strong, Text} from "@chakra-ui/react";

import type {MouseEvent} from "react";
import {useState} from "react";

import type {ShouldRevalidateFunction} from "react-router";
import {Outlet} from "react-router";

import * as v from "valibot";

import {
    PRESENTER_USER_STATES,
    requireAuthenticatedPresenterConnection,
} from "~/.server/services/rooms_service";

import {mapPublicUser} from "~/.server/services/users_service";

import Separator from "~/components/common/separator";

import Sidebar from "~/components/controlpanel/sidebar";

import CloseIcon from "~/components/icons/close_icon";
import DashboardIcon from "~/components/icons/dashboard_icon";
import ChartIcon from "~/components/icons/chart_icon";
import SlidersIcon from "~/components/icons/sliders_icon";

import AppShell from "~/components/shell/app_shell";

import {validateParams} from "~/guards/validation";

import {WebSocketCacheProvider} from "~/hooks/web_socket";

import type {IAttendee, IDisplay, IPresenterContext} from "~/state/presenter";
import {PresenterContextProvider, usePresenterContext} from "~/state/presenter";

import {PublicUserContextProvider} from "~/state/public_user";

import {buildFormData} from "~/utils/forms";

import type {IActionFormData} from "./rooms_.$roomID_.presenter_.actions_.room";

import {Route} from "./+types/rooms_.$roomID.presenter";

const LOADER_PARAMS_SCHEMA = v.object({
    roomID: v.pipe(v.string(), v.ulid()),
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

    const {attendees, displays, pin, state, title} = room;
    const publicUser = mapPublicUser(user);

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
                attendees: initialAttendees,
                displays: initialDisplays,

                pin,
                roomID,
                state,
                title,
            },

            state: PRESENTER_USER_STATES.disposed,
        } satisfies IPresenterContext,

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

    const [fetchingAction, setFetchingAction] = useState<boolean>(false);

    const isDisposed = state === "STATE_DISPOSED";
    const canFetchAction = !(isDisposed || fetchingAction);

    async function onDisposeClick(
        _event: MouseEvent<HTMLButtonElement, globalThis.MouseEvent>,
    ): Promise<void> {
        setFetchingAction(true);

        await fetch("./presenter/actions/room", {
            method: "POST",
            body: buildFormData<IActionFormData>({
                action: "state.dispose",
            }),
        });

        setFetchingAction(false);
    }

    return (
        <Sidebar.Root>
            <Sidebar.Container>
                <Sidebar.Link to={`/rooms/${roomID}/presenter`}>
                    <Sidebar.Icon>
                        <DashboardIcon />
                    </Sidebar.Icon>
                    Dashboard
                </Sidebar.Link>

                <Sidebar.Link to={`/rooms/${roomID}/presenter/polls`}>
                    <Sidebar.Icon>
                        <ChartIcon />
                    </Sidebar.Icon>
                    Polls
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
                    disabled={!canFetchAction}
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
        <AppShell.Root>
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
        </AppShell.Root>
    );
}
