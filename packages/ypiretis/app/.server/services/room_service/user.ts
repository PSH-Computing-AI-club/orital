import type {IUser as IServiceUser} from "../users_service";

import type {
    IEntity,
    IEntityNetworkEvent,
    IEntityEventData,
    IEntityOptions,
    IEntityStates,
} from "./entity";
import makeEntity from "./entity";

const SYMBOL_USER_BRAND: unique symbol = Symbol();

export interface IUserOptions extends IEntityOptions {
    readonly user: IServiceUser;
}

export interface IUser<
    T extends IEntityNetworkEvent<N, D>,
    S extends string = IEntityStates,
    N extends string = string,
    D extends IEntityEventData = IEntityEventData,
> extends IEntity<T, S> {
    [SYMBOL_USER_BRAND]: true;

    readonly user: IServiceUser;
}

export function isUser<
    T extends IEntityNetworkEvent<N, D>,
    S extends string = IEntityStates,
    N extends string = string,
    D extends IEntityEventData = IEntityEventData,
>(value: unknown): value is IUser<T, S> {
    return (
        value !== null &&
        typeof value === "object" &&
        SYMBOL_USER_BRAND in value
    );
}

export default function makeUser<
    T extends IEntityNetworkEvent<N, D>,
    S extends string = IEntityStates,
    N extends string = string,
    D extends IEntityEventData = IEntityEventData,
>(options: IUserOptions): IUser<T, S, N, D> {
    const {user} = options;

    const entity = makeEntity<T, S, N, D>(options);

    return {
        [SYMBOL_USER_BRAND]: true,

        user,

        ...entity,
    };
}
