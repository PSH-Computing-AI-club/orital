import {eq} from "drizzle-orm";

import type {SessionData} from "react-router";

import DATABASE from "../configuration/database";
import ENVIRONMENT from "../configuration/environment";
import * as persistentSession from "../configuration/persistent_session";

import USERS_TABLE from "../database/tables/users_table";

import makeSessionGuard from "../guards/session_guard";

const ACCOUNT_ADMIN_IDENTIFIERS = new Set(
    ENVIRONMENT.ACCOUNT_ADMIN_IDENTIFIERS,
);

export type IUser = Readonly<typeof USERS_TABLE.$inferSelect> & {
    readonly isAdmin: boolean;
};

export type IPublicUser = Omit<IUser, "createdAt" | "id">;

export type IUserInsert = Omit<
    Readonly<typeof USERS_TABLE.$inferInsert>,
    "createdAt" | "id"
>;

export interface IUserIdentifiable extends IUser {}

export interface IUserSessionData extends SessionData {
    readonly userID: number;
}

function mapUser(user: typeof USERS_TABLE.$inferSelect): IUser {
    const {accountID} = user;

    const isAdmin = ACCOUNT_ADMIN_IDENTIFIERS.has(accountID);

    return {
        ...user,
        isAdmin,
    };
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

export async function findOne(userID: number): Promise<IUser | null> {
    const user = await DATABASE.query.users.findFirst({
        where: eq(USERS_TABLE.id, userID),
    });

    return user ? mapUser(user) : null;
}

export async function findOneByAccountID(
    accountID: string,
): Promise<IUser | null> {
    const user = await DATABASE.query.users.findFirst({
        where: eq(USERS_TABLE.accountID, accountID),
    });

    return user ? mapUser(user) : null;
}

export async function insertOne(userData: IUserInsert): Promise<IUser> {
    const [user] = await DATABASE.insert(USERS_TABLE)
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
