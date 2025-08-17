import {Spacer, Strong, Text} from "@chakra-ui/react";

import type {MouseEventHandler} from "react";

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
import Toasts, {
    TOAST_STATUS,
    useToastsContext,
} from "~/components/controlpanel/toasts";

import HumanHandsupIcon from "~/components/icons/human_handsup_icon";
import HumanHandsdownIcon from "~/components/icons/human_handsdown_icon";
import LogoutIcon from "~/components/icons/logout_icon";

import {validateParams} from "~/guards/validation";

import {useAsyncCallback} from "~/hooks/async_callback";
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
    const {displayToast} = useToastsContext();

    const {state: roomState} = room;

    const [isFetchingAction, onHandClick] = useAsyncCallback(
        (async (_event) => {
            await fetch("./attendee/actions/self", {
                method: "POST",
                body: buildFormData<IActionFormData>({
                    action: isRaisingHand
                        ? "participation.dismissHand"
                        : "participation.raiseHand",
                }),
            });

            displayToast({
                status: TOAST_STATUS.success,
                title: isRaisingHand ? (
                    <>You lowered your hand</>
                ) : (
                    <>You raised your hand</>
                ),
            });
        }) satisfies MouseEventHandler<HTMLButtonElement>,

        [displayToast],
    );

    const isDisposed = roomState === "STATE_DISPOSED";
    const canUseHand = attendeeState === "STATE_CONNECTED";

    const isActionDisabled = isDisposed || isFetchingAction || !canUseHand;

    return (
        <Sidebar.Root>
            <Sidebar.Container>
                <Sidebar.Button
                    disabled={isActionDisabled}
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

                <Sidebar.Link to="/messages/rooms/left" colorPalette="red">
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
        <Toasts.Root>
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

            <Toasts.Container />
        </Toasts.Root>
    );
}
