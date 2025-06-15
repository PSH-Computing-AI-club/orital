import {data} from "react-router";

import * as v from "valibot";

import {
    ROOM_STATES,
    requireAuthenticatedPresenterAction,
} from "~/.server/services/room_service";

import {Route} from "./+types/rooms_.$roomID_.presenter_.actions_.room_.state";

const ACTION_FORM_DATA_SCHEMA = v.object({
    action: v.pipe(v.string(), v.picklist(["update"])),

    state: v.pipe(
        v.string(),
        v.picklist([
            ROOM_STATES.locked,
            ROOM_STATES.permissive,
            ROOM_STATES.unlocked,
        ]),
    ),
});

export type IActionFormData = v.InferOutput<typeof ACTION_FORM_DATA_SCHEMA>;

export async function action(actionArgs: Route.ActionArgs) {
    const {room} = await requireAuthenticatedPresenterAction(actionArgs);

    const {request} = actionArgs;
    const requestFormData = await request.formData();

    const {output, success} = v.safeParse(
        ACTION_FORM_DATA_SCHEMA,
        Object.fromEntries(requestFormData.entries()),
    );

    if (!success) {
        throw data("Bad Request", 400);
    }

    const {action, state} = output;

    switch (action) {
        case "update": {
            room.updateState(state);
            break;
        }
    }
}
