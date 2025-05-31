import {eq} from "drizzle-orm";

import {SessionData} from "react-router";

import DATABASE from "../configuration/database";

import USERS_TABLE from "../database/tables/users_table";

import makeSessionGuard from "../guards/session_guard";

import * as persistentSessionService from "./persistent_session_service";

export type IUser = typeof USERS_TABLE.$inferSelect;

export type IUserInsert = Omit<
    typeof USERS_TABLE.$inferInsert,
    "createdAt" | "id"
>;

export interface IUserSessionData extends SessionData {
    readonly userID: string;
}

const sessionGuard = makeSessionGuard<typeof USERS_TABLE, IUserSessionData>(
    USERS_TABLE,
    persistentSessionService,
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
