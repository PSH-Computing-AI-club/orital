import {data} from "react-router";

import {eventStream} from "remix-utils/sse/server";

import {findOneLiveByPIN} from "~/.server/services/room_service";
import {requireAuthenticatedSession} from "~/.server/services/users_service";

import type {Route} from "./+types/rooms_.$pin_.display_.events";

export async function loader(loaderArgs: Route.LoaderArgs) {
    const {params, request} = loaderArgs;
    const {signal} = request;

    const {identifiable: user} = await requireAuthenticatedSession(request);

    const {pin} = params;
    const room = findOneLiveByPIN(pin);

    if (
        room === null ||
        // **HACK:** Throwing a 404 is technically lying here. But, we want to
        // prevent information leakage regarding the PIN so PINs cannot be
        // enumerated.
        room.presenter.id !== user.id
    ) {
        throw data("Not Found", {
            status: 404,
        });
    }

    return eventStream(signal, (send, abort) => {
        const display = room.addDisplay({abort, send});

        return () => {
            display._dispose();
        };
    });
}
