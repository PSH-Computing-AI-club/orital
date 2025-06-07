import {data} from "react-router";

import {eventStream} from "remix-utils/sse/server";

import * as v from "valibot";

import {requireAuthenticatedAttendeeConnection} from "~/.server/services/room_service";

import {alphanumerical} from "~/utils/valibot";

import type {Route} from "./+types/rooms_.$pin_.attendee_.events";

const LOADER_SCHEMA = v.object({
    pin: v.pipe(v.string(), v.length(6), alphanumerical),
});

export async function loader(loaderArgs: Route.LoaderArgs) {
    const {params, request} = loaderArgs;
    const {signal} = request;

    const {output, success} = v.safeParse(LOADER_SCHEMA, params);

    if (!success) {
        throw data("Bad Request", 400);
    }

    const {room, user} = await requireAuthenticatedAttendeeConnection(
        request,
        output.pin,
    );

    return eventStream(signal, (send, abort) => {
        // **TODO:** consider how to handle room states, closed and permissive here
        const attendee = room.addAttendee({abort, send}, user);

        return () => {
            attendee._dispose();
        };
    });
}
