import {data} from "react-router";

import {eventStream} from "remix-utils/sse/server";

import * as v from "valibot";

import {requireAuthenticatedAttendeeConnection} from "~/.server/services/room_service";

import type {Route} from "./+types/rooms_.$roomID_.attendee_.events";

const LOADER_PARAMS_SCHEMA = v.object({
    roomID: v.pipe(v.string(), v.ulid()),
});

export async function loader(loaderArgs: Route.LoaderArgs) {
    const {params, request} = loaderArgs;
    const {signal} = request;

    const {output, success} = v.safeParse(LOADER_PARAMS_SCHEMA, params);

    if (!success) {
        throw data("Bad Request", 400);
    }

    const {room, user} = await requireAuthenticatedAttendeeConnection(
        request,
        output.roomID,
    );

    return eventStream(signal, (send, abort) => {
        // **TODO:** consider how to handle room states, closed and permissive here
        const attendee = room.addAttendee({abort, send}, user);

        return () => {
            attendee._dispose();
        };
    });
}
