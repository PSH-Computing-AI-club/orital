import {data} from "react-router";

import * as v from "valibot";

import {requireAuthenticatedAttendeeAction} from "~/.server/services/rooms_service";

import {validateFormData} from "~/guards/validation";

import {Route} from "./+types/rooms_.$roomID_.presenter_.actions_.attendees_.$entityID";

const PARTICIPATION_DISMISS_HAND_ACTION_FORM_DATA_SCHEMA = v.object({
    action: v.pipe(v.string(), v.literal("participation.dismissHand")),
});

const PARTICIPATION_RAISE_HAND_ACTION_FORM_DATA_SCHEMA = v.object({
    action: v.pipe(v.string(), v.literal("participation.raiseHand")),
});

const ACTION_FORM_DATA_SCHEMA = v.variant("action", [
    PARTICIPATION_DISMISS_HAND_ACTION_FORM_DATA_SCHEMA,
    PARTICIPATION_RAISE_HAND_ACTION_FORM_DATA_SCHEMA,
]);

export type IParticipationRaiseHandActionFormData = v.InferOutput<
    typeof PARTICIPATION_RAISE_HAND_ACTION_FORM_DATA_SCHEMA
>;

export type IActionFormData = v.InferOutput<typeof ACTION_FORM_DATA_SCHEMA>;

export async function action(actionArgs: Route.ActionArgs) {
    const {attendee} = await requireAuthenticatedAttendeeAction(actionArgs);

    const {action} = await validateFormData(
        ACTION_FORM_DATA_SCHEMA,
        actionArgs,
    );

    switch (action) {
        case "participation.dismissHand":
            if (!attendee.isRaisingHand) {
                throw data("Conflict", {
                    status: 409,
                });
            }

            attendee.dismissHand();
            break;

        case "participation.raiseHand":
            if (attendee.isRaisingHand) {
                throw data("Conflict", {
                    status: 409,
                });
            }

            attendee.raiseHand();
            break;
    }
}
