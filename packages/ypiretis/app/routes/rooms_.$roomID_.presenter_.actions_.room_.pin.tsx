import {data} from "react-router";

import * as v from "valibot";

import {
    requireAuthenticatedPresenterAction,
    generateUniquePIN,
} from "~/.server/services/room_service";

import {Route} from "./+types/rooms_.$roomID_.presenter_.actions_.room_.pin";

const ACTION_FORM_DATA_SCHEMA = v.object({
    action: v.pipe(v.string(), v.picklist(["regenerate"])),
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

    const {action} = output;

    switch (action) {
        case "regenerate": {
            const newPIN = generateUniquePIN();

            room.updatePIN(newPIN);
            break;
        }
    }
}
