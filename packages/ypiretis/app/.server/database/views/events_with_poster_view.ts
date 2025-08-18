import type {InferSelectViewModel} from "drizzle-orm";
import {eq, getTableColumns} from "drizzle-orm";

import {sqliteView} from "drizzle-orm/sqlite-core";

import EVENTS_TABLE from "../tables/events_table";
import USERS_TABLE from "../tables/users_table";

const EVENTS_WITH_POSTER_VIEW = sqliteView("events_with_poster").as((query) => {
    return query
        .select({
            ...getTableColumns(EVENTS_TABLE),

            poster: {
                ...getTableColumns(USERS_TABLE),
            },
        })
        .from(EVENTS_TABLE)
        .innerJoin(USERS_TABLE, eq(EVENTS_TABLE.posterUserID, USERS_TABLE.id));
});

export type IEventsWithPosterView = typeof EVENTS_WITH_POSTER_VIEW;

export type ISelectEventWithPoster =
    InferSelectViewModel<IEventsWithPosterView>;

export default EVENTS_WITH_POSTER_VIEW;
