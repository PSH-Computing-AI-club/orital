import * as v from "valibot";

import type {IPresenterUser} from "~/.server/services/rooms_service";
import {
    ENTITY_STATES,
    requireAuthenticatedPresenterConnection,
} from "~/.server/services/rooms_service";

import {useWebSocket} from "~/.server/state/web_socket";

import {ulid} from "~/.server/utils/valibot";

import {validateParams} from "~/guards/validation";

import type {Route} from "./+types/rooms_.$roomID_.presenter_.events";

const LOADER_PARAMS_SCHEMA = v.object({
    roomID: ulid,
});

export async function loader(loaderArgs: Route.LoaderArgs) {
    const {roomID} = validateParams(LOADER_PARAMS_SCHEMA, loaderArgs);

    const {room} = await requireAuthenticatedPresenterConnection(
        loaderArgs,
        roomID,
    );

    let presenter: IPresenterUser | null = null;

    useWebSocket({
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
