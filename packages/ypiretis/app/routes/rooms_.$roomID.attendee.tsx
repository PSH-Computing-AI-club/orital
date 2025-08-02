import {Spacer, Strong, Text} from "@chakra-ui/react";

import type {MouseEvent} from "react";
import {useState} from "react";

import type {ShouldRevalidateFunction} from "react-router";
import {Outlet} from "react-router";

import * as v from "valibot";

import {
    ATTENDEE_USER_STATES,
    requireAuthenticatedAttendeeConnection,
} from "~/.server/services/rooms_service";

import {ulid} from "~/.server/utils/valibot";

import Separator from "~/components/common/separator";

import Layout from "~/components/controlpanel/layout";
import Sidebar from "~/components/controlpanel/sidebar";

import HumanHandsupIcon from "~/components/icons/human_handsup_icon";
import HumanHandsdownIcon from "~/components/icons/human_handsdown_icon";
import LogoutIcon from "~/components/icons/logout_icon";

import {validateParams} from "~/guards/validation";

import {WebSocketCacheProvider} from "~/hooks/web_socket";

import type {IAttendeeContext} from "~/state/attendee";
import {AttendeeContextProvider, useAttendeeContext} from "~/state/attendee";
import {PublicUserContextProvider, mapPublicUser} from "~/state/public_user";

import {buildFormData} from "~/utils/forms";

import type {IActionFormData} from "./rooms_.$roomID_.attendee_.actions_.self";

import {Route} from "./+types/rooms_.$roomID.attendee";

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

    const {room, user} = await requireAuthenticatedAttendeeConnection(
        loaderArgs,
        roomID,
    );

    const {state} = room;
    const publicUser = mapPublicUser(user);

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

        publicUser,
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

function SidebarView() {
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
        <Sidebar.Root>
            <Sidebar.Container>
                <Sidebar.Button
                    disabled={!canFetchAction || !canUseHand}
                    colorPalette={isRaisingHand ? "cyan" : undefined}
                    onClick={onHandClick}
                >
                    <Sidebar.Icon>
                        {isRaisingHand ? (
                            <HumanHandsupIcon />
                        ) : (
                            <HumanHandsdownIcon />
                        )}
                    </Sidebar.Icon>
                    {isRaisingHand ? "Hand Raised" : "Hand Lowered"}
                </Sidebar.Button>

                <Spacer />

                <Separator.Horizontal />

                <Sidebar.Link to="/rooms/left" colorPalette="red">
                    <Sidebar.Icon>
                        <LogoutIcon />
                    </Sidebar.Icon>
                    Leave Room
                </Sidebar.Link>
            </Sidebar.Container>
        </Sidebar.Root>
    );
}

export default function RoomsPresenterLayout(props: Route.ComponentProps) {
    const {loaderData} = props;
    const {initialContextData, publicUser} = loaderData;

    return (
        <Layout.Root>
            <WebSocketCacheProvider>
                <PublicUserContextProvider publicUser={publicUser}>
                    <AttendeeContextProvider
                        initialContextData={initialContextData}
                    >
                        <SidebarView />

                        <Outlet />
                    </AttendeeContextProvider>
                </PublicUserContextProvider>
            </WebSocketCacheProvider>
        </Layout.Root>
    );
}
