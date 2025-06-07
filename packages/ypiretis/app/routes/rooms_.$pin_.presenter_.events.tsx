import {data} from "react-router";

import {eventStream} from "remix-utils/sse/server";

import * as v from "valibot";

import {
    insertOneLive,
    requireAuthenticatedPresenterConnection,
} from "~/.server/services/room_service";
import {findOne} from "~/.server/services/users_service";

import {alphanumerical} from "~/utils/valibot";

import type {Route} from "./+types/rooms_.$pin_.presenter_.events";

const TEST_PRESENTER = (await findOne(1))!;

const TEST_ROOM = await insertOneLive({
    presenter: TEST_PRESENTER,
});

console.log({
    TEST_ROOM_PIN: TEST_ROOM.pin,
});

const LOADER_SCHEMA = v.object({
    pin: v.pipe(v.string(), v.length(6), alphanumerical),
});

export async function loader(loaderArgs: Route.LoaderArgs) {
    const {params, request} = loaderArgs;
    const {signal} = request;

    const {output, success} = v.safeParse(LOADER_SCHEMA, params);

    if (!success) {
        throw data("Bad Request", 400);
    }

    const {room} = await requireAuthenticatedPresenterConnection(
        request,
        output.pin,
    );

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
