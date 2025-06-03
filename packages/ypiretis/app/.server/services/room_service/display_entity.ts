import type {IEntity} from "./entity";

const SYMBOL_DISPLAY_ENTITY_BRAND: unique symbol = Symbol();

export type IDisplayEvents = null;

export interface IDisplayEntity extends IEntity<IDisplayEvents> {
    [SYMBOL_DISPLAY_ENTITY_BRAND]: true;
}

export function isDisplayEntity(value: unknown): value is IDisplayEntity {
    return (
        value !== null &&
        typeof value === "object" &&
        SYMBOL_DISPLAY_ENTITY_BRAND in value
    );
}
