import {data} from "react-router";

import * as v from "valibot";

import {
    ATTENDEE_USER_STATES,
    requireAuthenticatedPresenterAction,
} from "~/.server/services/rooms_service";

import {validateFormData, validateParams} from "~/guards/validation";

import {number} from "~/utils/valibot";

import {Route} from "./+types/rooms_.$roomID_.presenter_.actions_.attendees_.$entityID";

const ACTION_PARAMS_SCHEMA = v.object({
    entityID: number,
});

const MODERATE_APPROVE_ACTION_FORM_DATA_SCHEMA = v.object({
    action: v.pipe(v.string(), v.literal("moderate.approve")),
});

const MODERATE_BAN_ACTION_FORM_DATA_SCHEMA = v.object({
    action: v.pipe(v.string(), v.literal("moderate.ban")),
});

const MODERATE_REJECT_ACTION_FORM_DATA_SCHEMA = v.object({
    action: v.pipe(v.string(), v.literal("moderate.reject")),
});

const MODERATE_KICK_ACTION_FORM_DATA_SCHEMA = v.object({
    action: v.pipe(v.string(), v.literal("moderate.kick")),
});

const PARTICIPATION_DISMISS_HAND_ACTION_FORM_DATA_SCHEMA = v.object({
    action: v.pipe(v.string(), v.literal("participation.dismissHand")),
});

const ACTION_FORM_DATA_SCHEMA = v.variant("action", [
    MODERATE_APPROVE_ACTION_FORM_DATA_SCHEMA,
    MODERATE_BAN_ACTION_FORM_DATA_SCHEMA,
    MODERATE_KICK_ACTION_FORM_DATA_SCHEMA,
    MODERATE_REJECT_ACTION_FORM_DATA_SCHEMA,
    PARTICIPATION_DISMISS_HAND_ACTION_FORM_DATA_SCHEMA,
]);

export type IModerateApproveActionFormData = v.InferOutput<
    typeof MODERATE_APPROVE_ACTION_FORM_DATA_SCHEMA
>;

export type IModerateBanActionFormData = v.InferOutput<
    typeof MODERATE_BAN_ACTION_FORM_DATA_SCHEMA
>;

export type IModerateRejectActionFormData = v.InferOutput<
    typeof MODERATE_REJECT_ACTION_FORM_DATA_SCHEMA
>;

export type IModerateKickActionFormData = v.InferOutput<
    typeof MODERATE_KICK_ACTION_FORM_DATA_SCHEMA
>;

export type IActionFormData = v.InferOutput<typeof ACTION_FORM_DATA_SCHEMA>;

export async function action(actionArgs: Route.ActionArgs) {
    const {room} = await requireAuthenticatedPresenterAction(actionArgs);

    const {entityID} = validateParams(ACTION_PARAMS_SCHEMA, actionArgs);

    const {action} = await validateFormData(
        ACTION_FORM_DATA_SCHEMA,
        actionArgs,
    );

    const attendee = room.attendees.get(entityID) ?? null;

    if (attendee === null) {
        throw data("Conflict", {
            status: 409,
        });
    }

    switch (action) {
        case "moderate.approve":
            if (attendee.state !== ATTENDEE_USER_STATES.awaiting) {
                throw data("Conflict", {
                    status: 409,
                });
            }

            attendee.approve();
            break;

        case "moderate.ban":
            attendee.ban();
            break;

        case "moderate.kick":
            attendee.kick();
            break;

        case "moderate.reject":
            attendee.reject();
            break;

        case "participation.dismissHand":
            if (!attendee.isRaisingHand) {
                throw data("Conflict", {
                    status: 409,
                });
            }

            attendee.dismissHand();
            break;
    }
}
