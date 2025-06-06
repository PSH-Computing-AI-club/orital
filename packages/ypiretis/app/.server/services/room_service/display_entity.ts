import type {IEntity, IEntityOptions} from "./entity";
import makeEntity from "./entity";

const SYMBOL_DISPLAY_ENTITY_BRAND: unique symbol = Symbol();

export type IDisplayEntityNetworkEvents = null;

export interface IDisplayEntityOptions extends IEntityOptions {}

export interface IDisplayEntity extends IEntity<IDisplayEntityNetworkEvents> {
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
    const entity = makeEntity<IDisplayEntityNetworkEvents>(options);

    return {
        ...entity,

        [SYMBOL_DISPLAY_ENTITY_BRAND]: true,
    };
}
