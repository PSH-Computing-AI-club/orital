import type {Temporal} from "@js-temporal/polyfill";

import type {InferSelectViewModel} from "drizzle-orm";
import {and, eq, getTableColumns, lte} from "drizzle-orm";

import {sqliteView} from "drizzle-orm/sqlite-core";

import EVENTS_TABLE, {EVENT_STATES} from "../tables/events_table";

import {DEFAULT_TEMPORAL_INSTANT} from "../types/temporal_instant";

const PUBLISHED_EVENTS_VIEW = sqliteView("published_events").as((query) => {
    return query
        .select({
            ...getTableColumns(EVENTS_TABLE),
        })
        .from(EVENTS_TABLE)
        .where(
            and(
                eq(EVENTS_TABLE.state, EVENT_STATES.published),
                lte(EVENTS_TABLE.publishedAt, DEFAULT_TEMPORAL_INSTANT),
            ),
        );
});

export type IPublishedEventsView = typeof PUBLISHED_EVENTS_VIEW;

export type ISelectPublishedEvent = Omit<
    InferSelectViewModel<IPublishedEventsView>,
    "publishedAt" | "state"
> & {
    publishedAt: Temporal.Instant;

    state: (typeof EVENT_STATES)["published"];
};

export default PUBLISHED_EVENTS_VIEW;
