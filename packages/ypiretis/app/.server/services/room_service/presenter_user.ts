import type {IUser, IUserOptions} from "./user";
import makeUser from "./user";

const SYMBOL_PRESENTER_USER_BRAND: unique symbol = Symbol();

export type IPresenterUserEvents = null;

export interface IPresenterUserOptions extends IUserOptions {}

export interface IPresenterUser extends IUser<IPresenterUserEvents> {
    [SYMBOL_PRESENTER_USER_BRAND]: true;
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
    const user = makeUser<IPresenterUserEvents>(options);

    return {
        [SYMBOL_PRESENTER_USER_BRAND]: true,

        ...user,
    };
}
