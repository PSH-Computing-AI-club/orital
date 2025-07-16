import {redirect} from "react-router";

import * as v from "valibot";

import {validateParams} from "~/.server/guards/validation";

import {ROOM_STATES, findOneLiveByPIN} from "~/.server/services/rooms_service";
import {requireAuthenticatedSession} from "~/.server/services/users_service";

import {pin as pinValidator} from "~/utils/valibot";

import {Route} from "./+types/r_.$pin";

const LOADER_PARAMS_SCHEMA = v.object({
    pin: v.pipe(v.string(), v.length(6), pinValidator),
});

export async function loader(loaderArgs: Route.LoaderArgs) {
    const {request} = loaderArgs;

    const {pin} = validateParams(LOADER_PARAMS_SCHEMA, loaderArgs);

    await requireAuthenticatedSession(request);

    const room = findOneLiveByPIN(pin);

    if (room === null) {
        return redirect("/rooms/not-found");
    }

    const {roomID, state} = room;

    if (state === ROOM_STATES.disposed) {
        return redirect("/rooms/disposed");
    }

    return redirect(`/rooms/${roomID}/attendee`);
}
