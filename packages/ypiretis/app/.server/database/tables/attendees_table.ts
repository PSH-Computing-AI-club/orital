import {integer, sqliteTable, unique} from "drizzle-orm/sqlite-core";

import temporalInstant, {
    DEFAULT_TEMPORAL_INSTANT,
} from "../types/temporal_instant";

import ROOMS_TABLE from "./rooms_table";
import USERS_TABLE from "./users_table";

const ATTENDEES_TABLE = sqliteTable(
    "attendees",
    {
        id: integer("id").primaryKey({autoIncrement: true}),

        roomID: integer("room_id")
            .notNull()
            .references(() => ROOMS_TABLE.id, {onDelete: "cascade"}),

        userID: integer("user_id")
            .notNull()
            .references(() => USERS_TABLE.id, {onDelete: "cascade"}),

        createdAt: temporalInstant("created_at")
            .notNull()
            .default(DEFAULT_TEMPORAL_INSTANT),
    },

    (table) => {
        return [
            unique("attendees_room_id_user_id_unique").on(
                table.roomID,
                table.userID,
            ),
        ];
    },
);

export type IInsertAttendee = Readonly<typeof ATTENDEES_TABLE.$inferInsert>;

export type ISelectAttendee = Readonly<typeof ATTENDEES_TABLE.$inferSelect>;

export type IUpdateAttendee = Partial<IInsertAttendee>;

export type IAttendeesTable = typeof ATTENDEES_TABLE;

export default ATTENDEES_TABLE;
