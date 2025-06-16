import type {IEntity, IEntityMessages, IEntityOptions} from "./entity";
import makeEntity, {ENTITY_STATES} from "./entity";
import type {IRoomPINUpdateMessage} from "./messages";
import {SYMBOL_ENTITY_ON_DISPOSE} from "./symbols";

const SYMBOL_DISPLAY_ENTITY_BRAND: unique symbol = Symbol();

export const DISPLAY_ENTITY_STATES = {
    ...ENTITY_STATES,
} as const;

export type IDisplayEntityStates =
    (typeof DISPLAY_ENTITY_STATES)[keyof typeof DISPLAY_ENTITY_STATES];

export type IDisplayEntityMessages = IRoomPINUpdateMessage | IEntityMessages;

export interface IDisplayEntityOptions extends IEntityOptions {}

export interface IDisplayEntity
    extends IEntity<IDisplayEntityMessages, IDisplayEntityStates> {
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

    const entity = makeEntity<IDisplayEntityMessages, IDisplayEntityStates>(
        options,
    );

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
