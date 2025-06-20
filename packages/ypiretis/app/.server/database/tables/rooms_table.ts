import {relations} from "drizzle-orm";
import {integer, sqliteTable, text} from "drizzle-orm/sqlite-core";

import {ulid} from "ulid";

import temporalInstant, {
    DEFAULT_TEMPORAL_INSTANT,
} from "../types/temporal_instant";

import USERS_TABLE from "./users_table";

const ROOMS_TABLE = sqliteTable("rooms", {
    id: integer("id").primaryKey({autoIncrement: true}),

    roomID: text("room_id")
        .notNull()
        .unique()
        .$defaultFn(() => ulid()),

    presenterUserID: text("presenter_user_id")
        .notNull()
        .references(() => USERS_TABLE.id, {onDelete: "cascade"}),

    title: text("title", {length: 32}).notNull().default("A Presentation Room"),

    createdAt: temporalInstant("created_at")
        .notNull()
        .default(DEFAULT_TEMPORAL_INSTANT),
});

export const ROOMS_RELATIONS = relations(
    ROOMS_TABLE,

    ({one}) => {
        return {
            ownerAccount: one(USERS_TABLE, {
                fields: [ROOMS_TABLE.presenterUserID],
                references: [USERS_TABLE.id],
            }),
        };
    },
);

export type IRoomsTable = typeof ROOMS_TABLE;

export default ROOMS_TABLE;
