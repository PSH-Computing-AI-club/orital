import {extend} from "../../utils/prototypes";

import type {IEntity, IEntityOptions} from "./entity";
import makeEntity from "./entity";
import type {IDisplayEntityMessages} from "./messages";
import {MESSAGE_EVENTS} from "./messages";
import type {IDisplayEntityStates} from "./states";
import {SYMBOL_DISPLAY_ENTITY_BRAND, SYMBOL_ENTITY_ON_DISPOSE} from "./symbols";

export type IDisplayEntity = IEntity<
    IDisplayEntityMessages,
    IDisplayEntityStates
> & {
    [SYMBOL_DISPLAY_ENTITY_BRAND]: true;
};

export interface IDisplayEntityOptions
    extends IEntityOptions<IDisplayEntityStates> {}

export function isDisplayEntity(value: unknown): value is IDisplayEntity {
    return (
        value !== null &&
        typeof value === "object" &&
        SYMBOL_DISPLAY_ENTITY_BRAND in value
    );
}

export default function makeDisplayEntity(
    options: IDisplayEntityOptions,
): IDisplayEntity {
    const {room} = options;

    const entity = makeEntity<IDisplayEntityMessages, IDisplayEntityStates>(
        options,
    );

    const display = extend(entity)({
        get [SYMBOL_DISPLAY_ENTITY_BRAND]() {
            return true as const;
        },

        [SYMBOL_ENTITY_ON_DISPOSE]() {
            entity[SYMBOL_ENTITY_ON_DISPOSE]();

            pinUpdateSubscription.dispose();
        },
    }) satisfies IDisplayEntity;

    const pinUpdateSubscription = room.EVENT_PIN_UPDATE.subscribe((event) => {
        const {newPIN} = event;

        display._dispatch({
            event: MESSAGE_EVENTS.roomPinUpdate,

            data: {
                pin: newPIN,
            },
        });
    });

    return display;
}
