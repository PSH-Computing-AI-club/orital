import type {
    ActionFunctionArgs,
    ClientActionFunctionArgs,
    ClientLoaderFunctionArgs,
    LoaderFunctionArgs,
    SessionData,
} from "react-router";
import {data} from "react-router";

import RUNTIME_ENVIRONMENT from "../configuration/runtime_environment";
import * as persistentSession from "../configuration/persistent_session";

import type {
    IUsersTable,
    IInsertUser as _IInsertUser,
    ISelectUser as _ISelectUser,
    IUpdateUser as _IUpdateUser,
} from "../database/tables/users_table";
import USERS_TABLE from "../database/tables/users_table";

import makeSessionGuard from "../guards/session_guard";

import {makeWritableCRUDService} from "./crud_service";

const ACCOUNT_ADMIN_IDENTIFIERS = new Set(
    RUNTIME_ENVIRONMENT.ACCOUNT_ADMIN_IDENTIFIERS,
);

export type IUser = _ISelectUser & {
    readonly isAdmin: boolean;
};

export type IInsertUser = _IInsertUser;

export type IUpdateUser = _IUpdateUser;

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
    IUsersTable,
    _ISelectUser,
    _IInsertUser,
    _IUpdateUser,
    IUser
>({
    table: USERS_TABLE,
    mapValue: mapUser,
});

export function mapUser(user: _ISelectUser): IUser {
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
