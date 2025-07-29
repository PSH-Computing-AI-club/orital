import * as v from "valibot";

import type {IDisplayEntity} from "~/.server/services/rooms_service";
import {
    ENTITY_STATES,
    requireAuthenticatedDisplayConnection,
} from "~/.server/services/rooms_service";

import {ulid} from "~/.server/utils/valibot";
import {webSocket} from "~/.server/utils/web_socket";

import {validateParams} from "~/guards/validation";

import type {Route} from "./+types/rooms_.$roomID_.display_.events";

const LOADER_PARAMS_SCHEMA = v.object({
    roomID: ulid,
});

export async function loader(loaderArgs: Route.LoaderArgs) {
    const {roomID} = validateParams(LOADER_PARAMS_SCHEMA, loaderArgs);

    const {room} = await requireAuthenticatedDisplayConnection(
        loaderArgs,
        roomID,
    );

    let display: IDisplayEntity | null = null;

    webSocket({
        onClose(_event, _connection) {
            if (display !== null && display.state !== ENTITY_STATES.disposed) {
                display._dispose();
            }
        },

        onOpen(_event, connection) {
            display = room.addDisplay(connection);
        },
    });
}
