import * as v from "valibot";

import {validateParams} from "~/.server/guards/validation";

import type {IPresenterUser} from "~/.server/services/rooms_service";
import {
    ENTITY_STATES,
    requireAuthenticatedPresenterConnection,
} from "~/.server/services/rooms_service";

import {webSocket} from "~/.server/utils/web_socket";

import type {Route} from "./+types/rooms_.$roomID_.presenter_.events";

const LOADER_PARAMS_SCHEMA = v.object({
    roomID: v.pipe(v.string(), v.ulid()),
});

export async function loader(loaderArgs: Route.LoaderArgs) {
    const {request} = loaderArgs;

    const {roomID} = validateParams(LOADER_PARAMS_SCHEMA, loaderArgs);

    const {room} = await requireAuthenticatedPresenterConnection(
        request,
        roomID,
    );

    let presenter: IPresenterUser | null = null;

    webSocket({
        onClose(_event, _connection) {
            if (
                presenter !== null &&
                presenter.state !== ENTITY_STATES.disposed
            ) {
                presenter._dispose();
            }
        },

        onOpen(_event, connection) {
            presenter = room.addPresenter(connection);
        },
    });
}
