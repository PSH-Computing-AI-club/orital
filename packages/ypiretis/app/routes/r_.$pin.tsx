import {data, redirect} from "react-router";

import * as v from "valibot";

import {ROOM_STATES, findOneLiveByPIN} from "~/.server/services/rooms_service";
import {requireAuthenticatedSession} from "~/.server/services/users_service";

import {pin as pinValidator} from "~/utils/valibot";

import {Route} from "./+types/r_.$pin";

const LOADER_PARAMS_SCHEMA = v.object({
    pin: v.pipe(v.string(), v.length(6), pinValidator),
});

export async function loader(loaderArgs: Route.LoaderArgs) {
    const {params, request} = loaderArgs;

    const {output: paramsData, success: isValidParams} = v.safeParse(
        LOADER_PARAMS_SCHEMA,
        params,
    );

    if (!isValidParams) {
        throw data("Bad Request", 400);
    }

    await requireAuthenticatedSession(request);

    const {pin} = paramsData;
    const room = findOneLiveByPIN(pin);

    if (room === null) {
        throw data("Not Found", {
            status: 404,
        });
    }

    if (room.state === ROOM_STATES.disposed) {
        throw data("Conflict", 409);
    }

    return redirect(`/rooms/${room.roomID}/attendee`);
}
