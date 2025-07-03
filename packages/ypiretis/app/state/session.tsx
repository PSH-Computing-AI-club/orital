import type {PropsWithChildren} from "react";
import {createContext, useContext} from "react";

const CONTEXT_SESSION = createContext<ISession | null>(null);

export interface IEntity {
    readonly entityID: number;
}

export interface ISession {
    readonly accountID: string;

    readonly firstName: string;

    readonly lastName: string;
}

export interface ISessionContextProviderProps extends PropsWithChildren {
    readonly session: ISession;
}

export function SessionContextProvider(props: ISessionContextProviderProps) {
    const {children, session} = props;

    return (
        <CONTEXT_SESSION.Provider value={session}>
            {children}
        </CONTEXT_SESSION.Provider>
    );
}

export function useAuthenticatedSessionContext(): ISession {
    const context = useContext(CONTEXT_SESSION);

    if (context === null) {
        throw new ReferenceError(
            `bad dispatch to 'useAuthenticatedSessionContext' (not a child of 'SessionContextProvider')`,
        );
    }

    return context;
}

export function useOptionalSessionContext(): ISession | null {
    return useContext(CONTEXT_SESSION);
}
