import {data} from "react-router";

import * as v from "valibot";

import type {IPresenterUser} from "~/.server/services/room_service";
import {requireAuthenticatedPresenterConnection} from "~/.server/services/room_service";

import {webSocket} from "~/.server/utils/web_socket";

import type {Route} from "./+types/rooms_.$roomID_.presenter_.events";

const LOADER_PARAMS_SCHEMA = v.object({
    roomID: v.pipe(v.string(), v.ulid()),
});

export async function loader(loaderArgs: Route.LoaderArgs) {
    const {params, request} = loaderArgs;

    const {output, success} = v.safeParse(LOADER_PARAMS_SCHEMA, params);

    if (!success) {
        throw data("Bad Request", 400);
    }

    const {room} = await requireAuthenticatedPresenterConnection(
        request,
        output.roomID,
    );

    let presenter: IPresenterUser | null = null;

    webSocket({
        onClose(_event, _connection) {
            presenter?._dispose();
        },

        onOpen(_event, connection) {
            presenter = room.addPresenter(connection);
        },
    });
}
