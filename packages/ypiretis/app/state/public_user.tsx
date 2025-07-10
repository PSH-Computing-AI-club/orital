import type {PropsWithChildren} from "react";
import {createContext, useContext} from "react";

import type {IPublicUser} from "~/.server/services/users_service";

const CONTEXT_USER = createContext<IPublicUser | null>(null);

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
