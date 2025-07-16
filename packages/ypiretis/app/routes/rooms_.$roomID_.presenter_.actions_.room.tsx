import * as v from "valibot";

import {validateFormData} from "~/.server/guards/validation";

import {
    ROOM_STATES,
    generateUniquePIN,
    requireAuthenticatedPresenterAction,
} from "~/.server/services/rooms_service";

import {title} from "~/utils/valibot";

import {Route} from "./+types/rooms_.$roomID_.presenter_.actions_.room";

const PIN_REGENERATE_ACTION_FORM_DATA_SCHEMA = v.object({
    action: v.pipe(v.string(), v.literal("pin.regenerate")),
});

const STATE_DISPOSE_ACTION_FORM_DATA_SCHEMA = v.object({
    action: v.pipe(v.string(), v.literal("state.dispose")),
});

const STATE_UPDATE_ACTION_FORM_DATA_SCHEMA = v.object({
    action: v.pipe(v.string(), v.literal("state.update")),

    state: v.pipe(
        v.string(),
        v.picklist([
            ROOM_STATES.locked,
            ROOM_STATES.permissive,
            ROOM_STATES.unlocked,
        ]),
    ),
});

const TITLE_UPDATE_ACTION_FORM_DATA_SCHEMA = v.object({
    action: v.pipe(v.string(), v.literal("title.update")),

    title: v.pipe(v.string(), v.nonEmpty(), v.maxLength(32), title),
});

const ACTION_FORM_DATA_SCHEMA = v.variant("action", [
    PIN_REGENERATE_ACTION_FORM_DATA_SCHEMA,
    STATE_DISPOSE_ACTION_FORM_DATA_SCHEMA,
    STATE_UPDATE_ACTION_FORM_DATA_SCHEMA,
    TITLE_UPDATE_ACTION_FORM_DATA_SCHEMA,
]);

export type IPINRegenerateActionFormData = v.InferOutput<
    typeof PIN_REGENERATE_ACTION_FORM_DATA_SCHEMA
>;

export type IStateUpdateActionFormData = v.InferOutput<
    typeof STATE_UPDATE_ACTION_FORM_DATA_SCHEMA
>;

export type ITitleUpdateActionFormData = v.InferOutput<
    typeof TITLE_UPDATE_ACTION_FORM_DATA_SCHEMA
>;

export type IActionFormData = v.InferOutput<typeof ACTION_FORM_DATA_SCHEMA>;

export async function action(actionArgs: Route.ActionArgs) {
    const {room} = await requireAuthenticatedPresenterAction(actionArgs);

    const formData = await validateFormData(
        ACTION_FORM_DATA_SCHEMA,
        actionArgs,
    );

    const {action} = formData;

    switch (action) {
        case "pin.regenerate": {
            const newPIN = generateUniquePIN();

            room.updatePIN(newPIN);
            break;
        }

        case "state.dispose":
            room.dispose();
            break;

        case "state.update": {
            const {state} = formData;

            room.updateState(state);
            break;
        }

        case "title.update": {
            const {title} = formData;

            room.updateTitle(title);
            break;
        }
    }
}
