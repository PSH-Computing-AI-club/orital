import {relations} from "drizzle-orm";
import {integer, sqliteTable, text} from "drizzle-orm/sqlite-core";

import temporalInstant, {
    DEFAULT_TEMPORAL_INSTANT,
} from "../types/temporal_instant";

import ROOMS_TABLE from "./rooms_table";
import USERS_TABLE from "./users_table";

const ATTENDEES_TABLE = sqliteTable("attendees", {
    id: integer("id").primaryKey({autoIncrement: true}),

    roomID: text("room_id")
        .notNull()
        .unique()
        .references(() => ROOMS_TABLE.id, {onDelete: "cascade"}),

    accountID: text("account_id")
        .notNull()
        .references(() => USERS_TABLE.id, {onDelete: "cascade"}),

    createdAt: temporalInstant("created_at")
        .notNull()
        .default(DEFAULT_TEMPORAL_INSTANT),
});

export const ATTENDEES_RELATIONS = relations(
    ATTENDEES_TABLE,

    ({one}) => {
        return {
            account: one(USERS_TABLE, {
                fields: [ATTENDEES_TABLE.accountID],
                references: [USERS_TABLE.id],
            }),

            room: one(ROOMS_TABLE, {
                fields: [ATTENDEES_TABLE.roomID],
                references: [ROOMS_TABLE.id],
            }),
        };
    },
);

export type IAttendeeTable = typeof ATTENDEES_TABLE;

export default ATTENDEES_TABLE;
