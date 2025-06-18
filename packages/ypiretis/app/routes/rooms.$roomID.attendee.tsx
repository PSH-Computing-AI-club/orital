import {Strong, Text} from "@chakra-ui/react";

import type {ShouldRevalidateFunction} from "react-router";
import {Outlet, data} from "react-router";

import * as v from "valibot";

import {
    ATTENDEE_USER_STATES,
    requireAuthenticatedAttendeeConnection,
} from "~/.server/services/rooms_service";

import {WebSocketCacheProvider} from "~/hooks/web_socket";

import type {IAttendeeContext} from "~/state/attendee";
import {AttendeeContextProvider} from "~/state/attendee";

import type {ISession} from "~/state/session";
import {SessionContextProvider} from "~/state/session";

import {Route} from "./+types/rooms.$roomID.attendee";

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

export default function RoomsPresenterLayout(props: Route.ComponentProps) {
    const {loaderData} = props;
    const {initialContextData, session} = loaderData;

    return (
        <WebSocketCacheProvider>
            <SessionContextProvider session={session}>
                <AttendeeContextProvider
                    initialContextData={initialContextData}
                >
                    <Outlet />
                </AttendeeContextProvider>
            </SessionContextProvider>
        </WebSocketCacheProvider>
    );
}
