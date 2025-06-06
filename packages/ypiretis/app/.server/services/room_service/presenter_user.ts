import type {IUser, IUserOptions} from "./user";
import makeUser from "./user";

const SYMBOL_PRESENTER_USER_BRAND: unique symbol = Symbol();

export type IPresenterUserNetworkEvents = null;

export interface IPresenterUserOptions extends IUserOptions {}

export interface IPresenterUser extends IUser<IPresenterUserNetworkEvents> {
    [SYMBOL_PRESENTER_USER_BRAND]: true;

    [SYMBOL_ENTITY_ON_DISPOSE](): void;
}

export function isPresenterUser(value: unknown): value is IPresenterUser {
    return (
        value !== null &&
        typeof value === "object" &&
        SYMBOL_PRESENTER_USER_BRAND in value
    );
}

export default function makePresenterUser(
    options: IPresenterUserOptions,
): IPresenterUser {
    const user = makeUser<IPresenterUserNetworkEvents>(options);

    return {
        ...user,

        [SYMBOL_PRESENTER_USER_BRAND]: true,
    };
}
