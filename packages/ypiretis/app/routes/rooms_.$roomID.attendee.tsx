import {Spacer, Strong, Text} from "@chakra-ui/react";

import type {MouseEvent} from "react";
import {useState} from "react";

import type {ShouldRevalidateFunction} from "react-router";
import {Outlet, data} from "react-router";

import * as v from "valibot";

import {
    ATTENDEE_USER_STATES,
    requireAuthenticatedAttendeeConnection,
} from "~/.server/services/rooms_service";

import HumanHandsupIcon from "~/components/icons/human_handsup_icon";
import HumanHandsdownIcon from "~/components/icons/human_handsdown_icon";
import LogoutIcon from "~/components/icons/logout_icon";

import AppShell from "~/components/shell/app_shell";

import {WebSocketCacheProvider} from "~/hooks/web_socket";

import type {IAttendeeContext} from "~/state/attendee";
import {AttendeeContextProvider, useAttendeeContext} from "~/state/attendee";

import type {ISession} from "~/state/session";
import {SessionContextProvider} from "~/state/session";

import {buildFormData} from "~/utils/forms";

import type {IActionFormData} from "./rooms_.$roomID_.attendee_.actions_.self";

import {Route} from "./+types/rooms_.$roomID.attendee";

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

    const {room, user} = await requireAuthenticatedAttendeeConnection(
        request,
        output.roomID,
    );

    const {roomID, state} = room;
    const {accountID, firstName, lastName} = user;

    return {
        initialContextData: {
            isRaisingHand: false,

            room: {
                roomID,
                state,
                title: "",
            },

            state: ATTENDEE_USER_STATES.disposed,
        } satisfies IAttendeeContext,

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
                    use the attendee portal.
                </Text>
            </noscript>

            <Text>Loading...</Text>
        </>
    );
}

function Sidebar() {
    const {room, isRaisingHand, state: attendeeState} = useAttendeeContext();
    const {state} = room;

    const [fetchingAction, setFetchingAction] = useState<boolean>(false);

    const isDisposed = state === "STATE_DISPOSED";
    const canFetchAction = !(isDisposed || fetchingAction);

    const canUseHand = attendeeState === "STATE_CONNECTED";

    async function onHandClick(
        _event: MouseEvent<HTMLButtonElement, globalThis.MouseEvent>,
    ): Promise<void> {
        setFetchingAction(true);

        await fetch("./attendee/actions/self", {
            method: "POST",
            body: buildFormData<IActionFormData>({
                action: isRaisingHand
                    ? "participation.dismissHand"
                    : "participation.raiseHand",
            }),
        });

        setFetchingAction(false);
    }

    return (
        <AppShell.Sidebar>
            <AppShell.Button
                disabled={!canFetchAction || !canUseHand}
                colorPalette={isRaisingHand ? "cyan" : undefined}
                onClick={onHandClick}
            >
                <AppShell.Icon>
                    {isRaisingHand ? (
                        <HumanHandsupIcon />
                    ) : (
                        <HumanHandsdownIcon />
                    )}
                </AppShell.Icon>
                {isRaisingHand ? "Hand Raised" : "Hand Lowered"}
            </AppShell.Button>

            <Spacer />

            <AppShell.Divider />

            <AppShell.Link to="/rooms/left" colorPalette="red">
                <AppShell.Icon>
                    <LogoutIcon />
                </AppShell.Icon>
                Leave Room
            </AppShell.Link>
        </AppShell.Sidebar>
    );
}

export default function RoomsPresenterLayout(props: Route.ComponentProps) {
    const {loaderData} = props;
    const {initialContextData, session} = loaderData;

    return (
        <AppShell.Root>
            <WebSocketCacheProvider>
                <SessionContextProvider session={session}>
                    <AttendeeContextProvider
                        initialContextData={initialContextData}
                    >
                        <Sidebar />

                        <Outlet />
                    </AttendeeContextProvider>
                </SessionContextProvider>
            </WebSocketCacheProvider>
        </AppShell.Root>
    );
}
