import type {IUser} from "../users_service";

import type {IEntity, IEntityOptions} from "./entity";
import makeEntity from "./entity";
import type {IMessage, IUserMessages} from "./messages";
import type {IUserStates} from "./states";
import {SYMBOL_USER_BRAND} from "./symbols";

export type IGenericUserEntity = IUserEntity<IUserMessages, IUserStates>;

export interface IUserEntityOptions<S extends string>
    extends IEntityOptions<S> {
    readonly user: IUser;
}

export interface IUserEntity<E extends IMessage, S extends string>
    extends IEntity<E, S> {
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

export default function makeUserEntity<E extends IMessage, S extends string>(
    options: IUserEntityOptions<S>,
): IUserEntity<E, S> {
    const {user} = options;

    const entity = makeEntity<E, S>(options);

    const userEntity = {
        ...entity,

        [SYMBOL_USER_BRAND]: true,

        user,
    } satisfies IUserEntity<E, S>;

    return userEntity;
}
