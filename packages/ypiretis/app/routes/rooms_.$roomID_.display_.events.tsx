import {data} from "react-router";

import * as v from "valibot";

import type {IDisplayEntity} from "~/.server/services/room_service";
import {requireAuthenticatedDisplayConnection} from "~/.server/services/room_service";

import {webSocket} from "~/.server/utils/web_socket";

import type {Route} from "./+types/rooms_.$roomID_.display_.events";

const LOADER_PARAMS_SCHEMA = v.object({
    roomID: v.pipe(v.string(), v.ulid()),
});

export async function loader(loaderArgs: Route.LoaderArgs) {
    const {params, request} = loaderArgs;

    const {output, success} = v.safeParse(LOADER_PARAMS_SCHEMA, params);

    if (!success) {
        throw data("Bad Request", 400);
    }

    const {room} = await requireAuthenticatedDisplayConnection(
        request,
        output.roomID,
    );

    let display: IDisplayEntity | null = null;

    webSocket({
        onClose(_event, _connection) {
            display?._dispose();
        },

        onOpen(_event, connection) {
            display = room.addDisplay(connection);
        },
    });
}
