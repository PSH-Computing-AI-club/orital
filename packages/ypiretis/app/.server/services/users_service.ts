import {eq} from "drizzle-orm";

import type {SessionData} from "react-router";

import DATABASE from "../configuration/database";
import * as persistentSession from "../configuration/persistent_session";

import USERS_TABLE from "../database/tables/users_table";

import makeSessionGuard from "../guards/session_guard";

export type IUser = typeof USERS_TABLE.$inferSelect;

export type IUserInsert = Omit<
    typeof USERS_TABLE.$inferInsert,
    "createdAt" | "id"
>;

export interface IUserSessionData extends SessionData {
    readonly userID: number;
}

const sessionGuard = makeSessionGuard<typeof USERS_TABLE, IUser>(
    USERS_TABLE,
    persistentSession,
    "userID",
);

export const getGrantHeader = sessionGuard.getGrantHeader;

export const getRevokeHeader = sessionGuard.getRevokeHeader;

export const requireAuthenticatedSession =
    sessionGuard.requireAuthenticatedSession;

export const requireGuestSession = sessionGuard.requireGuestSession;

export async function findOne(userID: number): Promise<IUser | null> {
    const user = await DATABASE.query.users.findFirst({
        where: eq(USERS_TABLE.id, userID),
    });

    return user ?? null;
}

export async function findOneByAccountID(
    accountID: string,
): Promise<IUser | null> {
    const user = await DATABASE.query.users.findFirst({
        where: eq(USERS_TABLE.accountID, accountID),
    });

    return user ?? null;
}

export async function insertOne(userData: IUserInsert): Promise<IUser> {
    const [user] = await DATABASE.insert(USERS_TABLE)
        .values(userData)
        .returning();

    return user;
}
