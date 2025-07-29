import {relations} from "drizzle-orm";

import ARTICLES_TABLE from "./articles_table";
import ATTENDEES_TABLE from "./attendees_table";
import CALLBACK_TOKENS_TABLE from "./callback_tokens_table";
import CONSENT_TOKENS_TABLE from "./consent_tokens_table";
import ROOMS_TABLE from "./rooms_table";
import UPLOADS_TABLE from "./uploads_table";
import USERS_TABLE from "./users_table";

export const ARTICLES_RELATIONS = relations(
    ARTICLES_TABLE,

    ({one}) => {
        return {
            poster: one(USERS_TABLE, {
                fields: [ARTICLES_TABLE.posterUserID],
                references: [USERS_TABLE.id],
            }),
        };
    },
);

export const ATTENDEES_RELATIONS = relations(
    ATTENDEES_TABLE,

    ({one}) => {
        return {
            room: one(ROOMS_TABLE, {
                fields: [ATTENDEES_TABLE.roomID],
                references: [ROOMS_TABLE.id],
            }),

            user: one(USERS_TABLE, {
                fields: [ATTENDEES_TABLE.userID],
                references: [USERS_TABLE.id],
            }),
        };
    },
);

export const CONSENT_TOKENS_RELATIONS = relations(
    CONSENT_TOKENS_TABLE,

    ({one}) => {
        return {
            callbackToken: one(CALLBACK_TOKENS_TABLE, {
                fields: [CONSENT_TOKENS_TABLE.callbackTokenID],
                references: [CALLBACK_TOKENS_TABLE.id],
            }),
        };
    },
);

export const ROOMS_RELATIONS = relations(
    ROOMS_TABLE,

    ({many, one}) => {
        return {
            attendees: many(ATTENDEES_TABLE),

            presenter: one(USERS_TABLE, {
                fields: [ROOMS_TABLE.presenterUserID],
                references: [USERS_TABLE.id],
            }),
        };
    },
);

export const UPLOADS_RELATIONS = relations(
    UPLOADS_TABLE,

    ({one}) => {
        return {
            uploader: one(USERS_TABLE, {
                fields: [UPLOADS_TABLE.uploaderUserID],
                references: [USERS_TABLE.id],
            }),
        };
    },
);

export const USERS_RELATIONS = relations(
    USERS_TABLE,

    ({many}) => {
        return {
            attendedRooms: many(ATTENDEES_TABLE),
            presentedRooms: many(ROOMS_TABLE),
            postedArticles: many(ARTICLES_TABLE),
            fileUploads: many(UPLOADS_TABLE),
        };
    },
);
