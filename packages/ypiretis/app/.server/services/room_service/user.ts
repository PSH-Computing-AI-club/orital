import type {IUser as IServiceUser} from "../users_service";

import type {
    IEntity,
    IEntityEvent,
    IEntityEventData,
    IEntityOptions,
} from "./entity";
import makeEntity from "./entity";

const SYMBOL_USER_BRAND: unique symbol = Symbol();

export interface IUserOptions extends IEntityOptions {
    readonly user: IServiceUser;
}

export interface IUser<
    T extends IEntityEvent<N, D>,
    N extends string = string,
    D extends IEntityEventData = IEntityEventData,
> extends IEntity<T> {
    [SYMBOL_USER_BRAND]: true;

    readonly user: IServiceUser;
}

export function isUser<
    T extends IEntityEvent<N, D>,
    N extends string = string,
    D extends IEntityEventData = IEntityEventData,
>(value: unknown): value is IEntity<T> {
    return (
        value !== null &&
        typeof value === "object" &&
        SYMBOL_USER_BRAND in value
    );
}

export default function makeUser<
    T extends IEntityEvent<N, D>,
    N extends string = string,
    D extends IEntityEventData = IEntityEventData,
>(options: IUserOptions) {
    const {user} = options;

    const Entity = makeEntity<T>(options);

    return {
        [SYMBOL_USER_BRAND]: true,

        user,

        ...Entity,
    };
}
