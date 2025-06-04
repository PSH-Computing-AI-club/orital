import {data} from "react-router";

import {eventStream} from "remix-utils/sse/server";

import {findOneLiveByPIN} from "~/.server/services/room_service";
import {requireAuthenticatedSession} from "~/.server/services/users_service";

import type {Route} from "./+types/rooms_.$pin_.attendee_.events";

export async function loader(loaderArgs: Route.LoaderArgs) {
    const {params, request} = loaderArgs;
    const {signal} = request;

    const {identifiable: user} = await requireAuthenticatedSession(request);

    const {pin} = params;
    const room = findOneLiveByPIN(pin);

    if (room === null) {
        throw data("Not Found", {
            status: 404,
        });
    }

    return eventStream(signal, (send, abort) => {
        // **TODO:** consider how to handle room states, closed and permissive here
        const attendee = room.addAttendee({abort, send}, user);

        return () => {
            attendee._dispose();
        };
    });
}
