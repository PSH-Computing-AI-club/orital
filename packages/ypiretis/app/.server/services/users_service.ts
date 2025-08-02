import type {
    ActionFunctionArgs,
    ClientActionFunctionArgs,
    ClientLoaderFunctionArgs,
    LoaderFunctionArgs,
    SessionData,
} from "react-router";
import {data} from "react-router";

import ENVIRONMENT from "../configuration/environment";
import * as persistentSession from "../configuration/persistent_session";

import type {
    IInsertUser as ITableInsertUser,
    ISelectUser as ITableSelectUser,
    IUpdateUser as ITableUpdateUser,
} from "../database/tables/users_table";
import USERS_TABLE from "../database/tables/users_table";

import makeSessionGuard from "../guards/session_guard";

import {makeWritableCRUDService} from "./crud_service";

const ACCOUNT_ADMIN_IDENTIFIERS = new Set(
    ENVIRONMENT.ACCOUNT_ADMIN_IDENTIFIERS,
);

export type IUser = ITableSelectUser & {
    readonly isAdmin: boolean;
};

export type IInsertUser = ITableInsertUser;

export type IUpdateUser = ITableUpdateUser;

export interface IUserSessionData extends SessionData {
    readonly userID: number;
}

const sessionGuard = makeSessionGuard(
    USERS_TABLE,
    persistentSession,
    "userID",
    mapUser,
);

export const getGrantHeaders = sessionGuard.getGrantHeaders;

export const getOptionalSession = sessionGuard.getOptionalSession;

export const getRevokeHeaders = sessionGuard.getRevokeHeaders;

export const requireAuthenticatedSession =
    sessionGuard.requireAuthenticatedSession;

export const requireGuestSession = sessionGuard.requireGuestSession;

export const {
    deleteAll,
    deleteOne,
    findAll,
    findOne,
    insertAll,
    insertOne,
    updateAll,
    updateOne,
} = makeWritableCRUDService<
    typeof USERS_TABLE,
    ITableSelectUser,
    ITableInsertUser,
    ITableUpdateUser,
    IUser
>({
    table: USERS_TABLE,
    mapValue: mapUser,
});

export function mapUser(user: ITableSelectUser): IUser {
    const {accountID} = user;

    const isAdmin = ACCOUNT_ADMIN_IDENTIFIERS.has(accountID);

    return {
        ...user,

        isAdmin,
    };
}

export async function requireAuthenticatedAdminSession(
    requestArgs:
        | ActionFunctionArgs
        | ClientActionFunctionArgs
        | ClientLoaderFunctionArgs
        | LoaderFunctionArgs,
): Extract<ReturnType<typeof requireAuthenticatedSession>, Promise<unknown>> {
    const session = await requireAuthenticatedSession(requestArgs);

    const {isAdmin} = session.identifiable;

    if (!isAdmin) {
        throw data("Unauthorized", {
            status: 401,
        });
    }

    return session;
}
