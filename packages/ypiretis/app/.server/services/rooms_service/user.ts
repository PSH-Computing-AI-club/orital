import type {IUser as IServiceUser} from "../users_service";

import type {IEntity, IEntityOptions} from "./entity";
import makeEntity from "./entity";
import type {IMessage, IUserMessages} from "./messages";
import type {IUserStates} from "./states";
import {SYMBOL_USER_BRAND} from "./symbols";

export type IGenericUser = IUser<IUserMessages, IUserStates>;

export interface IUserOptions extends IEntityOptions {
    readonly user: IServiceUser;
}

export interface IUser<
    E extends IMessage = IUserMessages,
    S extends string = IUserStates,
> extends IEntity<E, S> {
    [SYMBOL_USER_BRAND]: true;

    readonly user: IServiceUser;
}

export function isUser(value: unknown): value is IGenericUser {
    return (
        value !== null &&
        typeof value === "object" &&
        SYMBOL_USER_BRAND in value
    );
}

export default function makeUser<
    E extends IMessage,
    S extends string = IUserStates,
>(options: IUserOptions): IUser<E, S> {
    const {user} = options;

    const entity = makeEntity<E, S>(options);

    return {
        ...entity,

        [SYMBOL_USER_BRAND]: true,

        user,
    };
}
