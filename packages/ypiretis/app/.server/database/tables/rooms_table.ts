import {relations} from "drizzle-orm";
import {integer, sqliteTable, text} from "drizzle-orm/sqlite-core";

import {generatePIN} from "../../utils/crypto";

import temporalInstant, {
    DEFAULT_TEMPORAL_INSTANT,
} from "../types/temporal_instant";

import USERS_TABLE from "./users_table";

const ROOMS_TABLE = sqliteTable("rooms", {
    id: integer("id").primaryKey({autoIncrement: true}),

    pin: text("pin")
        .notNull()
        .unique()
        .$defaultFn(() => generatePIN()),

    ownerUserID: text("owner_user_id")
        .notNull()
        .references(() => USERS_TABLE.id, {onDelete: "cascade"}),

    title: text("title", {length: 32}).notNull(),

    createdAt: temporalInstant("created_at")
        .notNull()
        .default(DEFAULT_TEMPORAL_INSTANT),
});

export const ROOMS_RELATIONS = relations(
    ROOMS_TABLE,

    ({one}) => {
        return {
            ownerAccount: one(USERS_TABLE, {
                fields: [ROOMS_TABLE.ownerUserID],
                references: [USERS_TABLE.id],
            }),
        };
    },
);

export type IRoomsTable = typeof ROOMS_TABLE;

export default ROOMS_TABLE;
