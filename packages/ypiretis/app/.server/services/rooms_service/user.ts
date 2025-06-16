import type {IUser as IServiceUser} from "../users_service";

import type {
    IEntity,
    IEntityMessages,
    IEntityOptions,
    IEntityStates,
} from "./entity";
import makeEntity from "./entity";
import type {IEntityMessage, IEntityMessageData} from "./messages";

const SYMBOL_USER_BRAND: unique symbol = Symbol();

export type IUserMessages = IEntityMessages;

export type IGenericUser = IUser<IUserMessages, IEntityStates>;

export interface IUserOptions extends IEntityOptions {
    readonly user: IServiceUser;
}

export interface IUser<
    T extends IEntityMessage<N, D>,
    S extends string = IEntityStates,
    N extends string = string,
    D extends IEntityMessageData = IEntityMessageData,
> extends IEntity<T, S> {
    [SYMBOL_USER_BRAND]: true;

    readonly user: IServiceUser;
}

export function isUser<
    T extends IEntityMessage<N, D>,
    S extends string = IEntityStates,
    N extends string = string,
    D extends IEntityMessageData = IEntityMessageData,
>(value: unknown): value is IUser<T, S> {
    return (
        value !== null &&
        typeof value === "object" &&
        SYMBOL_USER_BRAND in value
    );
}

export default function makeUser<
    T extends IEntityMessage<N, D>,
    S extends string = IEntityStates,
    N extends string = string,
    D extends IEntityMessageData = IEntityMessageData,
>(options: IUserOptions): IUser<T, S, N, D> {
    const {user} = options;

    const entity = makeEntity<T, S, N, D>(options);

    return {
        ...entity,

        [SYMBOL_USER_BRAND]: true,

        user,
    };
}
