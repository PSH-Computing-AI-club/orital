import type {IUser as IServiceUser} from "../users_service";

import type {IEntity, IEntityOptions, IEntityStates} from "./entity";
import makeEntity from "./entity";
import type {IMessage, IMessageData, IUserMessages} from "./messages";
import {SYMBOL_USER_BRAND} from "./symbols";

export type IGenericUser = IUser<IUserMessages, IEntityStates>;

export interface IUserOptions extends IEntityOptions {
    readonly user: IServiceUser;
}

export interface IUser<
    T extends IMessage<N, D>,
    S extends string = IEntityStates,
    N extends string = string,
    D extends IMessageData = IMessageData,
> extends IEntity<T, S> {
    [SYMBOL_USER_BRAND]: true;

    readonly user: IServiceUser;
}

export function isUser<
    T extends IMessage<N, D>,
    S extends string = IEntityStates,
    N extends string = string,
    D extends IMessageData = IMessageData,
>(value: unknown): value is IUser<T, S> {
    return (
        value !== null &&
        typeof value === "object" &&
        SYMBOL_USER_BRAND in value
    );
}

export default function makeUser<
    T extends IMessage<N, D>,
    S extends string = IEntityStates,
    N extends string = string,
    D extends IMessageData = IMessageData,
>(options: IUserOptions): IUser<T, S, N, D> {
    const {user} = options;

    const entity = makeEntity<T, S, N, D>(options);

    return {
        ...entity,

        [SYMBOL_USER_BRAND]: true,

        user,
    };
}
