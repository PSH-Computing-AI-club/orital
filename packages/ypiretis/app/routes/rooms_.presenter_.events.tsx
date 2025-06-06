import {eventStream} from "remix-utils/sse/server";

import {insertOneLive} from "~/.server/services/room_service";
import {requireAuthenticatedSession} from "~/.server/services/users_service";

import type {Route} from "./+types/rooms_.presenter_.events";

export async function loader(loaderArgs: Route.LoaderArgs) {
    const {request} = loaderArgs;
    const {signal} = request;

    const {identifiable: user} = await requireAuthenticatedSession(request);

    const room = await insertOneLive({
        presenter: user,
    });

    return eventStream(signal, (send, abort) => {
        const presenter = room.addPresenter({
            abort,
            send,
        });

        return () => {
            presenter._dispose();
        };
    });
}
