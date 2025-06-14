import {data} from "react-router";

import * as v from "valibot";

import {
    requireAuthenticatedPresenterSession,
    generateUniquePIN,
} from "~/.server/services/room_service";

import {Route} from "./+types/rooms_.$roomID_.presenter_.actions_.room_.pin";

const ACTION_FORM_DATA_SCHEMA = v.object({
    action: v.pipe(v.string(), v.picklist(["regenerate"])),
});

const ACTION_PARAMS_SCHEMA = v.object({
    roomID: v.pipe(v.string(), v.ulid()),
});

export type IActionFormData = v.InferOutput<typeof ACTION_FORM_DATA_SCHEMA>;

export async function action(actionArgs: Route.ActionArgs) {
    const {params, request} = actionArgs;

    const {output: paramsData, success: isValidParams} = v.safeParse(
        ACTION_PARAMS_SCHEMA,
        params,
    );

    if (!isValidParams) {
        throw data("Bad Request", 400);
    }

    const {room} = await requireAuthenticatedPresenterSession(
        request,
        paramsData.roomID,
    );

    const requestFormData = await request.formData();

    const {output: formData, success: isValidFormData} = v.safeParse(
        ACTION_FORM_DATA_SCHEMA,
        Object.fromEntries(requestFormData.entries()),
    );

    if (!isValidFormData) {
        throw data("Bad Request", 400);
    }

    const {action} = formData;

    switch (action) {
        case "regenerate": {
            const newPIN = generateUniquePIN();

            room.updatePIN(newPIN);
            break;
        }
    }
}
