import {data} from "react-router";

import * as v from "valibot";

import type {IAttendeeUser} from "~/.server/services/rooms_service";
import {
    ENTITY_STATES,
    requireAuthenticatedAttendeeConnection,
} from "~/.server/services/rooms_service";

import {webSocket} from "~/.server/utils/web_socket";

import type {Route} from "./+types/rooms_.$roomID_.attendee_.events";

const LOADER_PARAMS_SCHEMA = v.object({
    roomID: v.pipe(v.string(), v.ulid()),
});

export async function loader(loaderArgs: Route.LoaderArgs) {
    const {params, request} = loaderArgs;

    const {output, success} = v.safeParse(LOADER_PARAMS_SCHEMA, params);

    if (!success) {
        throw data("Bad Request", {
            status: 400,
        });
    }

    const {room, user} = await requireAuthenticatedAttendeeConnection(
        request,
        output.roomID,
    );

    let attendee: IAttendeeUser | null = null;

    webSocket({
        onClose(_event, _connection) {
            if (
                attendee !== null &&
                attendee.state !== ENTITY_STATES.disposed
            ) {
                attendee._dispose();
            }
        },

        onOpen(_event, connection) {
            attendee = room.addAttendee(connection, user);
        },
    });
}
