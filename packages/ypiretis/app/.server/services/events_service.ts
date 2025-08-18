import {Temporal} from "@js-temporal/polyfill";

import {slug as slugify} from "github-slugger";

import {
    IEventsTable,
    IEventStates as _IEventStates,
    IInsertEvent as _IInsertEvent,
    ISelectEvent as _ISelectEvent,
    IUpdateEvent as _IUpdateEvent,
} from "../database/tables/events_table";
import EVENTS_TABLE, {
    EVENT_STATES as _EVENT_STATES,
} from "../database/tables/events_table";
import EVENTS_ATTACHMENTS_TABLE from "../database/tables/events_attachments_table";
import type {ISelectUser as _ISelectUser} from "../database/tables/users_table";
import type {
    IEventsWithPosterView,
    ISelectEventWithPoster as _ISelectEventWithPoster,
} from "../database/views/events_with_poster_view";
import EVENTS_WITH_POSTER_VIEW from "../database/views/events_with_poster_view";
import type {
    IPublishedEventsView,
    ISelectPublishedEvent as _ISelectPublishedEvent,
} from "../database/views/published_events_view";
import PUBLISHED_EVENTS_VIEW from "../database/views/published_events_view";

import makeAttachmentsService from "./attachments_service";
import {makeReadableCRUDService, makeWritableCRUDService} from "./crud_service";
import type {IUser} from "./users_service";
import {mapUser} from "./users_service";

const EDIT_GRACE_DURATION = Temporal.Duration.from({
    minutes: 1,
});

export const EVENT_STATES = _EVENT_STATES;

type IEventMappedData = {
    readonly hasBeenEdited: boolean;

    readonly slug: string;
};

type IEventMappedPosterData = {
    readonly poster: IUser;
};

export type IEventStates = _IEventStates;

export type IEvent = _ISelectEvent & IEventMappedData;

export type IEventInsert = _IInsertEvent;

export type IEventUpdate = _IUpdateEvent;

export type IEventWithPoster = _ISelectEventWithPoster &
    IEventMappedData &
    IEventMappedPosterData;

export type IPublishedEvent = _ISelectPublishedEvent & IEventMappedData;

export const {
    deleteAllAttachmentsByID,
    deleteAllAttachmentsByInternalID,
    deleteOneAttachmentByIDs,
    deleteOneAttachmentByInternalIDs,
    findAllAttachmentsByID,
    findAllAttachmentsByInternalID,
    handleOneAttachmentByID,
    handleOneAttachmentByInternalID,
} = makeAttachmentsService({
    attachmentsTable: EVENTS_ATTACHMENTS_TABLE,
    targetTable: EVENTS_TABLE,
    targetIDColumn: "eventID",
});

export const {
    deleteAll,
    deleteOne,
    findPaginatedAll,
    findOne,
    insertAll,
    insertOne,
    updateAll,
    updateOne,
} = makeWritableCRUDService<
    IEventsTable,
    _ISelectEvent,
    _IInsertEvent,
    _IUpdateEvent,
    IEvent
>({
    table: EVENTS_TABLE,
    mapValue: mapEvent,
});

export const {
    findOne: findOneWithPoster,
    findAll: findAllWithPoster,
    findPaginatedAll: findPaginatedAllWithPoster,
} = makeReadableCRUDService<
    IEventsWithPosterView,
    _ISelectEventWithPoster,
    IEventWithPoster
>({
    table: EVENTS_WITH_POSTER_VIEW,
    mapValue: mapEventWithPoster,
});

export const {
    findOne: findOnePublished,
    findAll: findAllPublished,
    findPaginatedAll: findPaginatedAllPublished,
} = makeReadableCRUDService<
    IPublishedEventsView,
    _ISelectPublishedEvent,
    IPublishedEvent
>({
    table: PUBLISHED_EVENTS_VIEW,
    mapValue: mapEvent,
});

export function mapEvent<T extends _ISelectEvent, R extends IEvent>(
    event: T,
): R {
    const {publishedAt, title, updatedAt} = event;

    const hasBeenEdited = publishedAt
        ? updatedAt.epochMilliseconds - publishedAt.epochMilliseconds >
          EDIT_GRACE_DURATION.total({
              unit: "milliseconds",
          })
        : false;

    const slug = slugify(title, false);

    return {
        ...event,

        hasBeenEdited,
        slug,
    } as unknown as R;
}

export function mapEventWithPoster<
    T extends _ISelectEventWithPoster,
    R extends IEventWithPoster,
>(event: T): R {
    const {poster} = event;

    return {
        ...mapEvent(event),

        poster: mapUser(poster),
    };
}
