import {Strong, Text} from "@chakra-ui/react";

import type {ShouldRevalidateFunction} from "react-router";
import {Outlet, data} from "react-router";

import * as v from "valibot";

import {requireAuthenticatedPresenterSession} from "~/.server/services/room_service";

import CloseIcon from "~/components/icons/close_icon";
import DashboardIcon from "~/components/icons/dashboard_icon";
import ChartIcon from "~/components/icons/chart_icon";
import SlidersIcon from "~/components/icons/sliders_icon";

import AppShell from "~/components/shell/app_shell";

import type {IAttendee, IDisplay, IRoom} from "~/state/presenter";
import {PresenterContextProvider} from "~/state/presenter";

import type {ISession} from "~/state/session";
import {SessionContextProvider} from "~/state/session";

import {Route} from "./+types/rooms.$roomID.presenter";

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
    const {params, request} = loaderArgs;

    const {output, success} = v.safeParse(LOADER_PARAMS_SCHEMA, params);

    if (!success) {
        throw data("Bad Request", 400);
    }

    const {room, user} = await requireAuthenticatedPresenterSession(
        request,
        output.roomID,
    );

    const {attendees, displays, pin, roomID, state, title} = room;
    const {accountID, firstName, lastName} = user;

    const initialAttendees = Array.from(attendees.values()).map((attendee) => {
        const {id: entityID, user} = attendee;
        const {accountID, firstName, lastName} = user;

        return {
            accountID,
            entityID,
            firstName,
            lastName,
        };
    }) satisfies IAttendee[];

    const initialDisplays = Array.from(displays.values()).map((display) => {
        const {id: entityID} = display;

        return {
            entityID,
        };
    }) satisfies IDisplay[];

    return {
        initialRoomData: {
            attendees: initialAttendees,
            displays: initialDisplays,

            pin,
            roomID,
            state,
            title,
        } satisfies IRoom,

        session: {
            accountID,
            firstName,
            lastName,
        } satisfies ISession,
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

export default function RoomsPresenterLayout(props: Route.ComponentProps) {
    const {loaderData} = props;
    const {initialRoomData, session} = loaderData;

    const {roomID} = initialRoomData;

    return (
        <AppShell.Root>
            <AppShell.Sidebar>
                <AppShell.Link to={`/rooms/${roomID}/presenter`}>
                    <AppShell.Icon>
                        <DashboardIcon />
                    </AppShell.Icon>
                    Dashboard
                </AppShell.Link>

                <AppShell.Link to={`/rooms/${roomID}/presenter/polls`}>
                    <AppShell.Icon>
                        <ChartIcon />
                    </AppShell.Icon>
                    Polls
                </AppShell.Link>

                <AppShell.Divider />

                <AppShell.Link to={`/rooms/${roomID}/presenter/settings`}>
                    <AppShell.Icon>
                        <SlidersIcon />
                    </AppShell.Icon>
                    Settings
                </AppShell.Link>

                <AppShell.Button
                    colorPalette="red"
                    onClick={() => console.log("hello world!")}
                >
                    <AppShell.Icon>
                        <CloseIcon />
                    </AppShell.Icon>
                    Close Room
                </AppShell.Button>
            </AppShell.Sidebar>

            <SessionContextProvider session={session}>
                <PresenterContextProvider initialRoomData={initialRoomData}>
                    <Outlet />
                </PresenterContextProvider>
            </SessionContextProvider>
        </AppShell.Root>
    );
}
