import {eq} from "drizzle-orm";

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

import type {IInsertUser, ISelectUser} from "../database/tables/users_table";
import USERS_TABLE from "../database/tables/users_table";

import makeSessionGuard from "../guards/session_guard";

import {useTransaction} from "../state/transaction";

const ACCOUNT_ADMIN_IDENTIFIERS = new Set(
    ENVIRONMENT.ACCOUNT_ADMIN_IDENTIFIERS,
);

export type IUser = ISelectUser & {
    readonly isAdmin: boolean;
};

export type IPublicUser = Omit<IUser, "createdAt" | "id">;

export type IUserInsert = Omit<IInsertUser, "createdAt" | "id">;

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

export function mapUser(user: ISelectUser): IUser {
    const {accountID} = user;

    const isAdmin = ACCOUNT_ADMIN_IDENTIFIERS.has(accountID);

    return {
        ...user,

        isAdmin,
    };
}

export async function findOne(userID: number): Promise<IUser | null> {
    const transaction = useTransaction();

    const user = await transaction.query.users.findFirst({
        where: eq(USERS_TABLE.id, userID),
    });

    return user ? mapUser(user) : null;
}

export async function findOneByAccountID(
    accountID: string,
): Promise<IUser | null> {
    const transaction = useTransaction();

    const user = await transaction.query.users.findFirst({
        where: eq(USERS_TABLE.accountID, accountID),
    });

    return user ? mapUser(user) : null;
}

export async function insertOne(userData: IUserInsert): Promise<IUser> {
    const transaction = useTransaction();

    const [user] = await transaction
        .insert(USERS_TABLE)
        .values(userData)
        .returning();

    return mapUser(user);
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
