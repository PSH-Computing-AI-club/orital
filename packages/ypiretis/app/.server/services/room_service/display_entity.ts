import type {IEntity, IEntityMessages, IEntityOptions} from "./entity";
import makeEntity, {SYMBOL_ENTITY_ON_DISPOSE} from "./entity";

import type {IRoomPINUpdateMessage} from "./messages";

const SYMBOL_DISPLAY_ENTITY_BRAND: unique symbol = Symbol();

export type IDisplayEntityMessages = IRoomPINUpdateMessage | IEntityMessages;

export interface IDisplayEntityOptions extends IEntityOptions {}

export interface IDisplayEntity extends IEntity<IDisplayEntityMessages> {
    [SYMBOL_DISPLAY_ENTITY_BRAND]: true;
}

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

    const entity = makeEntity<IDisplayEntityMessages>(options);

    const display = {
        ...entity,

        [SYMBOL_DISPLAY_ENTITY_BRAND]: true,

        [SYMBOL_ENTITY_ON_DISPOSE]() {
            entity[SYMBOL_ENTITY_ON_DISPOSE]();

            pinUpdateSubscription.dispose();
        },
    } satisfies IDisplayEntity;

    const pinUpdateSubscription = room.EVENT_PIN_UPDATE.subscribe((event) => {
        const {newPIN} = event;

        display._dispatch({
            event: "room.pinUpdate",

            data: {
                pin: newPIN,
            },
        });
    });

    return display;
}
