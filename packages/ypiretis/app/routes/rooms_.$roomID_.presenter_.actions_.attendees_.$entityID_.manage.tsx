import {data} from "react-router";

import * as v from "valibot";

import {
    ATTENDEE_USER_STATES,
    requireAuthenticatedPresenterAction,
} from "~/.server/services/room_service";

import {Route} from "./+types/rooms_.$roomID_.presenter_.actions_.attendees_.$entityID_.manage";

const ACTION_PARAMS_SCHEMA = v.object({
    entityID: v.pipe(
        v.string(),
        v.transform((value) => parseInt(value, 10)),
        v.number(),
    ),
});

const ACTION_FORM_DATA_SCHEMA = v.object({
    action: v.pipe(v.string(), v.picklist(["approve", "ban", "kick"])),
});

export type IActionFormData = v.InferOutput<typeof ACTION_FORM_DATA_SCHEMA>;

export async function action(actionArgs: Route.ActionArgs) {
    const {room} = await requireAuthenticatedPresenterAction(actionArgs);

    const {request, params: actionParams} = actionArgs;

    const {output: params, success: isValidParams} = v.safeParse(
        ACTION_PARAMS_SCHEMA,
        actionParams,
    );

    if (!isValidParams) {
        throw data("Bad Request", 400);
    }

    const requestFormData = await request.formData();

    const {output: formData, success: isValidFormData} = v.safeParse(
        ACTION_FORM_DATA_SCHEMA,
        Object.fromEntries(requestFormData.entries()),
    );

    if (!isValidFormData) {
        throw data("Bad Request", 400);
    }

    const {entityID} = params;
    const attendee = room.attendees.get(entityID) ?? null;

    if (attendee === null) {
        throw data("Conflict", {
            status: 409,
        });
    }

    const {action} = formData;

    switch (action) {
        case "approve":
            if (attendee.state !== ATTENDEE_USER_STATES.awaiting) {
                throw data("Conflict", {
                    status: 409,
                });
            }

            attendee.approve();
            break;

        case "ban":
            attendee.ban();
            break;

        case "kick":
            attendee.kick();
            break;
    }
}
