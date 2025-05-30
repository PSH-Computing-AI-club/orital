import {eq} from "drizzle-orm";

import DATABASE from "../configuration/database";

import USERS_TABLE from "../database/tables/users_table";

export type IUser = typeof USERS_TABLE.$inferSelect;

export type IUserInsert = Omit<
    typeof USERS_TABLE.$inferInsert,
    "createdAt" | "id"
>;

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
