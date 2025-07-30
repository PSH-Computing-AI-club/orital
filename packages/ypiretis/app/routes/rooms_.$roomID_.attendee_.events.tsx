import * as v from "valibot";

import type {IAttendeeUser} from "~/.server/services/rooms_service";
import {
    ENTITY_STATES,
    requireAuthenticatedAttendeeConnection,
} from "~/.server/services/rooms_service";

import {useWebSocket} from "~/.server/state/web_socket";

import {ulid} from "~/.server/utils/valibot";

import {validateParams} from "~/guards/validation";

import type {Route} from "./+types/rooms_.$roomID_.attendee_.events";

const LOADER_PARAMS_SCHEMA = v.object({
    roomID: ulid,
});

export async function loader(loaderArgs: Route.LoaderArgs) {
    const {roomID} = validateParams(LOADER_PARAMS_SCHEMA, loaderArgs);

    const {room, user} = await requireAuthenticatedAttendeeConnection(
        loaderArgs,
        roomID,
    );

    let attendee: IAttendeeUser | null = null;

    useWebSocket({
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
