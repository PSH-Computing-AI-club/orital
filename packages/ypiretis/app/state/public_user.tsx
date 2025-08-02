import type {PropsWithChildren} from "react";
import {createContext, useContext} from "react";

import type {IUser} from "~/.server/services/users_service";

const CONTEXT_USER = createContext<IPublicUser | null>(null);

export interface IPublicUser {
    readonly accountID: string;

    readonly firstName: string;

    readonly lastName: string;

    readonly isAdmin: boolean;
}

export interface IPublicUserContextProviderProps extends PropsWithChildren {
    readonly publicUser: IPublicUser;
}

export function PublicUserContextProvider(
    props: IPublicUserContextProviderProps,
) {
    const {children, publicUser: user} = props;

    return (
        <CONTEXT_USER.Provider value={user}>{children}</CONTEXT_USER.Provider>
    );
}

export function mapPublicUser(user: IUser): IPublicUser {
    const {accountID, firstName, lastName, isAdmin} = user;

    return {
        accountID,
        firstName,
        lastName,
        isAdmin,
    };
}

export function useAuthenticatedPublicUserContext(): IPublicUser {
    const context = useContext(CONTEXT_USER);

    if (context === null) {
        throw new ReferenceError(
            `bad dispatch to 'useAuthenticatedPublicUserContext' (not a child of 'PublicUserContextProvider')`,
        );
    }

    return context;
}

export function useOptionalPublicUserContext(): IPublicUser | null {
    return useContext(CONTEXT_USER);
}
