import type {IUser} from "./user";

const SYMBOL_PRESENTER_USER_BRAND: unique symbol = Symbol();

export type IPresenterEvents = null;

export interface IPresenterUser extends IUser<IPresenterEvents> {
    [SYMBOL_PRESENTER_USER_BRAND]: true;
}

export function isPresenterUser(value: unknown): value is IPresenterUser {
    return (
        value !== null &&
        typeof value === "object" &&
        SYMBOL_PRESENTER_USER_BRAND in value
    );
}
