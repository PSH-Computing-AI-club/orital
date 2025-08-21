import {Temporal} from "@js-temporal/polyfill";

import {index, integer, sqliteTable, text} from "drizzle-orm/sqlite-core";

import {ulid} from "ulid";

import noCaseText from "../types/no_case_text";
import temporalInstant, {
    DEFAULT_TEMPORAL_INSTANT,
} from "../types/temporal_instant";

import USERS_TABLE from "./users_table";

export const EVENT_STATES = {
    draft: "STATE_DRAFT",

    published: "STATE_PUBLISHED",
} as const;

const EVENTS_TABLE = sqliteTable(
    "events",
    {
        id: integer("id").primaryKey({autoIncrement: true}),

        eventID: text("event_id", {length: 26})
            .notNull()
            .unique()
            .$defaultFn(() => ulid()),

        posterUserID: integer("poster_user_id")
            .notNull()
            .references(() => USERS_TABLE.id, {onDelete: "cascade"}),

        state: text("state", {
            enum: [EVENT_STATES.draft, EVENT_STATES.published],
        }).notNull(),

        title: noCaseText("title", {length: 64}).notNull(),

        content: text("content").notNull(),

        startAt: temporalInstant("start_at"),

        endAt: temporalInstant("end_at"),

        location: text("location", {length: 128}),

        createdAt: temporalInstant("created_at")
            .notNull()
            .default(DEFAULT_TEMPORAL_INSTANT),

        updatedAt: temporalInstant("updated_at")
            .notNull()
            .default(DEFAULT_TEMPORAL_INSTANT)
            .$onUpdate(() => Temporal.Now.instant()),

        publishedAt: temporalInstant("published_at"),
    },

    (table) => {
        return [
            index("events_created_at_idx").on(table.createdAt),
            index("events_end_at_idx").on(table.endAt),
            index("events_location_idx").on(table.location),
            index("events_published_at_idx").on(table.publishedAt),
            index("events_start_at_idx").on(table.startAt),
            index("events_state_idx").on(table.state),
            index("events_title_idx").on(table.title),
            index("events_updated_at_idx").on(table.updatedAt),

            index("events_state_published_at_idx").on(
                table.state,
                table.publishedAt,
            ),
        ];
    },
);

export type IEventStates = (typeof EVENT_STATES)[keyof typeof EVENT_STATES];

export type IEventsTable = typeof EVENTS_TABLE;

export type IInsertEvent = Omit<
    Readonly<IEventsTable["$inferInsert"]>,
    "eventID" | "createdAt" | "id" | "updatedAt"
>;

export type ISelectEvent = Readonly<IEventsTable["$inferSelect"]>;

export type IUpdateEvent = Partial<IInsertEvent>;

export default EVENTS_TABLE;
