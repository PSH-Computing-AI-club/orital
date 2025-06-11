import type {IEntityMessages} from "./entity";
import type {IEntity, IEntityOptions} from "./entity";
import makeEntity from "./entity";

const SYMBOL_DISPLAY_ENTITY_BRAND: unique symbol = Symbol();

export type IDisplayEntityMessages = IEntityMessages;

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
    const entity = makeEntity<IDisplayEntityMessages>(options);

    return {
        ...entity,

        [SYMBOL_DISPLAY_ENTITY_BRAND]: true,
    };
}
