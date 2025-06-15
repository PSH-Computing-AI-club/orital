import {data} from "react-router";

import * as v from "valibot";

import {requireAuthenticatedPresenterAction} from "~/.server/services/room_service";

import {title} from "~/utils/valibot";

import {Route} from "./+types/rooms_.$roomID_.presenter_.actions_.room_.title";

const ACTION_FORM_DATA_SCHEMA = v.object({
    action: v.pipe(v.string(), v.picklist(["update"])),

    title: v.pipe(v.string(), v.minLength(1), v.maxLength(32), title),
});

export type IActionFormData = v.InferOutput<typeof ACTION_FORM_DATA_SCHEMA>;

export async function action(actionArgs: Route.ActionArgs) {
    const {room} = await requireAuthenticatedPresenterAction(actionArgs);

    const {request} = actionArgs;
    const formData = await request.formData();

    const {output, success} = v.safeParse(
        ACTION_FORM_DATA_SCHEMA,
        Object.fromEntries(formData.entries()),
    );

    if (!success) {
        throw data("Bad Request", 400);
    }

    const {action, title} = output;

    switch (action) {
        case "update": {
            room.updateTitle(title);
            break;
        }
    }
}
