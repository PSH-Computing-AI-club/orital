import {Strong, Text} from "@chakra-ui/react";

import {Outlet, data} from "react-router";

import * as v from "valibot";

import {ROOM_ID_PREFIX} from "~/.server/database/tables/rooms_table";

import {requireAuthenticatedPresenterSession} from "~/.server/services/room_service";

import type {IAttendee, IDisplay, IRoom} from "~/state/presenter";
import {PresenterContextProvider} from "~/state/presenter";

import type {ISession} from "~/state/session";
import {SessionContextProvider} from "~/state/session";

import {token} from "~/utils/valibot";

import {Route} from "./+types/rooms.$roomID.presenter";

const LOADER_SCHEMA = v.object({
    roomID: token(ROOM_ID_PREFIX),
});

export function clientLoader(loaderArgs: Route.ClientLoaderArgs) {
    return loaderArgs.serverLoader();
}

clientLoader.hydrate = true as const;

export async function loader(loaderArgs: Route.LoaderArgs) {
    const {params, request} = loaderArgs;

    const {output, success} = v.safeParse(LOADER_SCHEMA, params);

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

    return (
        <SessionContextProvider session={session}>
            <PresenterContextProvider initialRoomData={initialRoomData}>
                <Outlet />
            </PresenterContextProvider>
        </SessionContextProvider>
    );
}
