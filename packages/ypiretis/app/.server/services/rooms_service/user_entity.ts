import type {IUser} from "../users_service";

import type {IEntity, IEntityOptions} from "./entity";
import makeEntity from "./entity";
import type {IMessage, IUserMessages} from "./messages";
import type {IUserStates} from "./states";
import {SYMBOL_USER_BRAND} from "./symbols";

export type IGenericUserEntity = IUserEntity<IUserMessages, IUserStates>;

export interface IUserEntityOptions extends IEntityOptions {
    readonly user: IUser;
}

export interface IUserEntity<
    E extends IMessage = IUserMessages,
    S extends string = IUserStates,
> extends IEntity<E, S> {
    [SYMBOL_USER_BRAND]: true;

    readonly user: IUser;
}

export function isUserEntity(value: unknown): value is IGenericUserEntity {
    return (
        value !== null &&
        typeof value === "object" &&
        SYMBOL_USER_BRAND in value
    );
}

export default function makeUserEntity<
    E extends IMessage = IUserMessages,
    S extends string = IUserStates,
>(options: IUserEntityOptions): IUserEntity<E, S> {
    const {user} = options;

    const entity = makeEntity<E, S>(options);

    return {
        ...entity,

        [SYMBOL_USER_BRAND]: true,

        user,
    };
}
